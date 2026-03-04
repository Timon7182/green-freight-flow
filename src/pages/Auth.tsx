import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Package } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error(t("auth.fillAll")); return; }
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? t("auth.wrongCreds") : error.message);
    } else {
      toast.success(t("auth.welcome"));
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) { toast.error(t("auth.fillAll")); return; }
    if (signupPassword.length < 6) { toast.error(t("auth.minPassword")); return; }
    if (signupPassword !== signupConfirm) { toast.error(t("auth.noMatch")); return; }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("auth.signupSuccess"), { description: t("auth.checkEmail") });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <img src="/logo.svg" alt="JJ" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">JJ</h1>
          <p className="text-muted-foreground mt-1">{t("auth.title")}</p>
        </div>
        <Card>
          <Tabs defaultValue="login">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input id="login-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.loginBtn")}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("auth.email")}</Label>
                    <Input id="signup-email" type="email" placeholder="your@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("auth.password")}</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t("auth.confirmPassword")}</Label>
                    <Input id="signup-confirm" type="password" placeholder="••••••••" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} autoComplete="new-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.signupBtn")}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
