import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_attendance_planner";

interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  collegeName?: string;
  department?: string;
  semester?: string;
  attendanceGoal?: number;
  setupComplete: boolean;
}

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
  targetPercentage: number;
}

// In-memory databases
const db_users: User[] = [
  {
    id: "user_1",
    fullName: "Abhishek",
    email: "abhishekburan47@gmail.com",
    // bcrypt hash for "password123"
    passwordHash: bcrypt.hashSync("password123", 10),
    collegeName: "SaaS University",
    department: "Computer Science & Engineering",
    semester: "Semester 6",
    attendanceGoal: 75,
    setupComplete: true,
  }
];

const db_user_subjects: Record<string, Subject[]> = {
  user_1: [
    { id: "sub_1", name: "Mathematics II", attended: 18, total: 24, targetPercentage: 75 },
    { id: "sub_2", name: "Computer Networks", attended: 14, total: 15, targetPercentage: 75 },
    { id: "sub_3", name: "Database Management", attended: 12, total: 18, targetPercentage: 75 },
    { id: "sub_4", name: "Artificial Intelligence", attended: 8, total: 14, targetPercentage: 75 },
  ]
};

// Initial default subjects to copy for newly registered users so they don't start empty
const DEFAULT_SUBJECT_TEMPLATES = [
  { name: "Mathematics II", attended: 18, total: 24, targetPercentage: 75 },
  { name: "Computer Networks", attended: 14, total: 15, targetPercentage: 75 },
  { name: "Database Management", attended: 12, total: 18, targetPercentage: 75 },
  { name: "Artificial Intelligence", attended: 8, total: 14, targetPercentage: 75 },
];

function getSubjectsForUser(userId: string): Subject[] {
  if (!db_user_subjects[userId]) {
    // Seed with a clone of default subjects
    db_user_subjects[userId] = DEFAULT_SUBJECT_TEMPLATES.map((tpl, idx) => ({
      id: `sub_${userId}_${idx + 1}`,
      name: tpl.name,
      attended: tpl.attended,
      total: tpl.total,
      targetPercentage: tpl.targetPercentage,
    }));
  }
  return db_user_subjects[userId];
}

// Middleware: Authenticate Token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Access token is invalid or expired" });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- AUTHENTICATION API ---

  // Register
  app.post("/api/auth/register", (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields (Full Name, Email, Password) are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = db_users.find(u => u.email.toLowerCase() === emailLower);
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      fullName: fullName.trim(),
      email: emailLower,
      passwordHash: bcrypt.hashSync(password, 10),
      setupComplete: false,
    };

    db_users.push(newUser);

    // Create a JWT token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        setupComplete: false,
      }
    });
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = db_users.find(u => u.email.toLowerCase() === emailLower);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        collegeName: user.collegeName,
        department: user.department,
        semester: user.semester,
        attendanceGoal: user.attendanceGoal || 75,
        setupComplete: user.setupComplete,
      }
    });
  });

  // Profile Setup
  app.post("/api/auth/profile-setup", authenticateToken, (req: any, res) => {
    const { collegeName, department, semester, attendanceGoal } = req.body;
    const userId = req.user.id;

    const user = db_users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.collegeName = collegeName || "SaaS University";
    user.department = department || "General";
    user.semester = semester || "Semester 1";
    user.attendanceGoal = Number(attendanceGoal) || 75;
    user.setupComplete = true;

    // Apply the goal to user's subjects as the new baseline
    const subjects = getSubjectsForUser(userId);
    subjects.forEach(sub => {
      sub.targetPercentage = user.attendanceGoal || 75;
    });

    res.json({
      message: "Profile setup completed successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        collegeName: user.collegeName,
        department: user.department,
        semester: user.semester,
        attendanceGoal: user.attendanceGoal,
        setupComplete: true,
      }
    });
  });

  // Get current user profile
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const user = db_users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        collegeName: user.collegeName,
        department: user.department,
        semester: user.semester,
        attendanceGoal: user.attendanceGoal || 75,
        setupComplete: user.setupComplete,
      }
    });
  });


  // --- SCOPED ATTENDANCE & SUBJECT ROUTE ENDPOINTS ---

  // API - Get all subjects
  app.get("/api/subjects", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    res.json(getSubjectsForUser(userId));
  });

  // API - Create a new subject
  app.post("/api/subjects", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { name, attended, total, targetPercentage } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const subjects = getSubjectsForUser(userId);
    const new_id = `sub_${userId}_${Date.now()}`;
    const new_subject = {
      id: new_id,
      name,
      attended: Number(attended) || 0,
      total: Number(total) || 0,
      targetPercentage: Number(targetPercentage) || 75,
    };
    subjects.push(new_subject);
    res.status(201).json(new_subject);
  });

  // API - Log attendance (Present or Absent check-in)
  app.post("/api/attendance", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { subjectId, status } = req.body;
    if (!subjectId || !["present", "absent"].includes(status)) {
      return res.status(400).json({ error: "Invalid subjectId or status" });
    }

    const subjects = getSubjectsForUser(userId);
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) {
      return res.status(404).json({ error: "Subject not found" });
    }

    sub.total += 1;
    if (status === "present") {
      sub.attended += 1;
    }

    const percentage = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0.0;
    res.json({
      message: `Logged ${status} for ${sub.name}`,
      subject: sub,
      currentPercentage: Number(percentage.toFixed(2)),
    });
  });

  // API - Predict Attendance
  app.post("/api/predict", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { subjectId, upcomingClasses, expectedAttendanceRate } = req.body;
    if (!subjectId || upcomingClasses === undefined || expectedAttendanceRate === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const subjects = getSubjectsForUser(userId);
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const attended = sub.attended;
    const total = sub.total;
    const target = sub.targetPercentage;

    const upcoming = Number(upcomingClasses);
    const rateFraction = Number(expectedAttendanceRate) / 100.0;

    const predicted_attended = attended + Math.round(upcoming * rateFraction);
    const predicted_total = total + upcoming;

    const current_pct = total > 0 ? (attended / total) * 100.0 : 100.0;
    const predicted_pct = predicted_total > 0 ? (predicted_attended / predicted_total) * 100.0 : 100.0;

    // Consecutive classes to reach target
    const target_frac = target / 100.0;
    let required_consecutive = 0;
    if (current_pct < target) {
      if (target_frac < 1.0) {
        const val = (target_frac * total - attended) / (1.0 - target_frac);
        required_consecutive = Math.max(0, Math.ceil(val));
      } else {
        required_consecutive = attended < total ? 999 : 0;
      }
    }

    // Classes safe to miss without falling below target
    let safe_to_miss = 0;
    if (current_pct >= target) {
      if (target_frac > 0) {
        const val = (attended - target_frac * total) / target_frac;
        safe_to_miss = Math.max(0, Math.floor(val));
      } else {
        safe_to_miss = 999;
      }
    }

    let riskStatus: "safe" | "at_risk" | "critical" = "safe";
    let message = "";

    if (predicted_pct >= target) {
      riskStatus = "safe";
      message = `You are on track! If you attend at ${expectedAttendanceRate}% rate, you will maintain ${predicted_pct.toFixed(1)}% attendance.`;
    } else if (predicted_pct >= target - 5) {
      riskStatus = "at_risk";
      message = `Warning: Your attendance will dip to ${predicted_pct.toFixed(1)}%, which is close but below your ${target}% target.`;
    } else {
      riskStatus = "critical";
      message = `Critical: Your attendance will fall to ${predicted_pct.toFixed(1)}%. You need to attend ${required_consecutive} classes consecutively to secure your target.`;
    }

    res.json({
      subjectId,
      currentPercentage: Number(current_pct.toFixed(1)),
      predictedPercentage: Number(predicted_pct.toFixed(1)),
      targetPercentage: target,
      requiredConsecutiveClasses: required_consecutive,
      safeToMissClasses: safe_to_miss,
      status: riskStatus,
      message,
    });
  });

  // API - High-level aggregate statistics
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const subjects = getSubjectsForUser(userId);

    if (subjects.length === 0) {
      return res.json({
        totalSubjects: 0,
        overallPercentage: 100.0,
        totalAttended: 0,
        totalConducted: 0,
        safeSubjects: 0,
        belowTargetSubjects: 0,
      });
    }

    const total_attended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const total_conducted = subjects.reduce((sum, s) => sum + s.total, 0);
    const overall_percentage = total_conducted > 0 ? (total_attended / total_conducted) * 100.0 : 100.0;

    let safe_subjects = 0;
    subjects.forEach((s) => {
      const pct = s.total > 0 ? (s.attended / s.total) * 100.0 : 100.0;
      if (pct >= s.targetPercentage) {
        safe_subjects += 1;
      }
    });

    res.json({
      totalSubjects: subjects.length,
      overallPercentage: Number(overall_percentage.toFixed(1)),
      totalAttended: total_attended,
      totalConducted: total_conducted,
      safeSubjects: safe_subjects,
      belowTargetSubjects: subjects.length - safe_subjects,
    });
  });

  // API - Reset to initial state
  app.post("/api/reset", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    db_user_subjects[userId] = DEFAULT_SUBJECT_TEMPLATES.map((tpl, idx) => ({
      id: `sub_${userId}_${idx + 1}`,
      name: tpl.name,
      attended: tpl.attended,
      total: tpl.total,
      targetPercentage: tpl.targetPercentage,
    }));
    res.json({ message: "Database reset to defaults", subjects: db_user_subjects[userId] });
  });

  // API - Attendance Risk Analysis
  app.get("/api/attendance/risk", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const subjects = getSubjectsForUser(userId);

    if (subjects.length === 0) {
      return res.json({
        riskScore: 0,
        riskLevel: "SAFE",
        overallAttendance: 100.0,
        remainingSafeBunks: 0,
        reasons: ["No subjects registered yet"]
      });
    }

    const total_attended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const total_conducted = subjects.reduce((sum, s) => sum + s.total, 0);
    const overall_pct = total_conducted > 0 ? (total_attended / total_conducted) * 100.0 : 100.0;

    let score = 0;
    let reasons: string[] = [];
    let totalSafeBunks = 0;
    let subjectsBelow75 = 0;

    subjects.forEach((s) => {
      const pct = s.total > 0 ? (s.attended / s.total) * 100.0 : 100.0;
      const target_frac = s.targetPercentage / 100.0;

      // Safe bunks calculation
      let safe_to_miss = 0;
      if (pct >= s.targetPercentage) {
        if (target_frac > 0) {
          const val = (s.attended - target_frac * s.total) / target_frac;
          safe_to_miss = Math.max(0, Math.floor(val));
        } else {
          safe_to_miss = 999;
        }
      }
      totalSafeBunks += safe_to_miss;

      if (pct < 75) {
        subjectsBelow75++;
        score += 10;
        reasons.push(`${s.name} subject below target`);
      }

      // Check if missed frequently (pct < 65%)
      if (pct < 65) {
        reasons.push(`Missing ${s.name} frequently`);
      }
    });

    // Overall Attendance below 75%
    if (overall_pct < 75) {
      score += 35;
      reasons.push("Overall attendance below target");
    }

    // Attendance trend is decreasing
    const hasDecreasingTrend = subjectsBelow75 > 0 || overall_pct < 78;
    if (hasDecreasingTrend) {
      score += 15;
      reasons.push("Attendance trend is decreasing");
    }

    // 3 consecutive absences simulated
    const hasConsecutiveAbsences = subjects.some(s => s.total > 0 && (s.attended / s.total) < 0.70);
    if (hasConsecutiveAbsences) {
      score += 20;
      reasons.push("Multiple consecutive absences flagged");
    }

    // Very few safe bunks remaining
    if (totalSafeBunks <= 2) {
      score += 20;
      reasons.push("Only few safe bunks remaining before detention risk");
    }

    // Clamp score
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine level
    let riskLevel: "SAFE" | "MEDIUM" | "HIGH" | "CRITICAL" = "SAFE";
    if (finalScore >= 81) {
      riskLevel = "CRITICAL";
    } else if (finalScore >= 61) {
      riskLevel = "HIGH";
    } else if (finalScore >= 31) {
      riskLevel = "MEDIUM";
    }

    if (reasons.length === 0) {
      if (finalScore === 0) {
        reasons.push("Your attendance is healthy.");
      } else {
        reasons.push("Keep maintaining your regular attendance.");
      }
    }

    reasons = Array.from(new Set(reasons));

    res.json({
      riskScore: finalScore,
      riskLevel,
      overallAttendance: Number(overall_pct.toFixed(1)),
      remainingSafeBunks: totalSafeBunks,
      reasons
    });
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"} mode)`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
