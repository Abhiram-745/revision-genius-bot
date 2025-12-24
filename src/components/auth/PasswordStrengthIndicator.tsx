import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
  { label: "Special character (!@#$%^&*)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { strength, passedCount, results } = useMemo(() => {
    const results = requirements.map((req) => ({
      ...req,
      passed: req.test(password),
    }));
    const passedCount = results.filter((r) => r.passed).length;
    const strength = (passedCount / requirements.length) * 100;
    return { strength, passedCount, results };
  }, [password]);

  const getStrengthLabel = () => {
    if (passedCount <= 1) return { label: "Very Weak", color: "bg-destructive" };
    if (passedCount === 2) return { label: "Weak", color: "bg-orange-500" };
    if (passedCount === 3) return { label: "Fair", color: "bg-yellow-500" };
    if (passedCount === 4) return { label: "Good", color: "bg-primary" };
    return { label: "Strong", color: "bg-secondary" };
  };

  const { label, color } = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`font-medium ${passedCount >= 4 ? "text-primary" : passedCount >= 3 ? "text-yellow-600" : "text-destructive"}`}>
            {label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${color}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {results.map((req, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {req.passed ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.passed ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
