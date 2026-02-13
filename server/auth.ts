import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

export function setupAuth(app: Express) {
    const MemoryStore = createMemoryStore(session);
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "freakers_secret_key_change_in_prod",
        resave: false,
        saveUninitialized: false,
        cookie: {},
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1); // trust first proxy
        sessionSettings.cookie = {
            secure: true,
        };
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    // Hardcoded Admin User
    // In a real app, this should be in the database with hashed passwords
    const ADMIN_USER = {
        id: 1,
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "admin",
    };

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            if (
                username === ADMIN_USER.username &&
                password === ADMIN_USER.password
            ) {
                return done(null, ADMIN_USER);
            } else {
                return done(null, false, { message: "Invalid username or password" });
            }
        }),
    );

    passport.serializeUser((user, done) => {
        done(null, (user as any).id);
    });

    passport.deserializeUser((id, done) => {
        if (id === ADMIN_USER.id) {
            done(null, ADMIN_USER);
        } else {
            done(null, false);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.json({ message: "Logged in successfully", user });
            });
        })(req, res, next);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.json({ message: "Logged out successfully" });
        });
    });

    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).json({ message: "Not authenticated" });
        }
    });
}

export function isAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized. Please login." });
}
