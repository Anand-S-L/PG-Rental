import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Use a long random string for SESSION_SECRET in production
  const sessionSecret = process.env.SESSION_SECRET || "pg-rental-session-secret";

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Use email instead of username for authentication
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // API Routes for authentication
  app.post("/api/register", async (req, res, next) => {
    try {
      const parsedBody = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      }).safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
      }

      const { name, email, password } = parsedBody.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        name,
        email,
        password: await hashPassword(password),
        role: 'customer',
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin registration (for initial setup)
  app.post("/api/admin/register", async (req, res, next) => {
    try {
      // Check if an admin already exists to prevent multiple admin creation
      const existingAdmins = await storage.getAdminUsers();
      if (existingAdmins.length > 0) {
        return res.status(403).json({ message: "Admin account already exists" });
      }

      const parsedBody = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        adminKey: z.string(), // A secret key to authorize admin creation
      }).safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
      }

      const { name, email, password, adminKey } = parsedBody.data;

      // Verify admin key (this should be a secure env variable in production)
      const expectedAdminKey = process.env.ADMIN_KEY || "secure-admin-setup-key";
      if (adminKey !== expectedAdminKey) {
        return res.status(403).json({ message: "Invalid admin key" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const admin = await storage.createUser({
        name,
        email,
        password: await hashPassword(password),
        role: 'admin',
      });

      res.status(201).json({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      });
    })(req, res, next);
  });

  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin rights required." });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  });

  // Middleware to check admin rights
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin rights required" });
    }
    next();
  });
}
