import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Truck, Package, Mail, Shield, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const handleComplete = () => {
    if (role) {
      login(role, { email, name, company, phone });
      navigate(role === "customer" ? "/customer/create" : "/carrier/orders");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">SilkWay</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s <= step ? "bg-primary w-10" : "bg-border w-6"
              )}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold">Кто вы?</h2>
                <p className="text-sm text-muted-foreground mt-1">Выберите вашу роль</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "customer" as UserRole, label: "Заказчик", desc: "Заказываю перевозки", icon: Package },
                  { id: "carrier" as UserRole, label: "Перевозчик", desc: "Перевожу грузы", icon: Truck },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                      role === r.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/40 hover:bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                      role === r.id ? "bg-primary" : "bg-muted"
                    )}>
                      <r.icon className={cn("h-7 w-7", role === r.id ? "text-primary-foreground" : "text-muted-foreground")} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!role} onClick={() => setStep(2)}>
                Далее <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Mail className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
                <h2 className="text-xl font-bold">Введите email</h2>
                <p className="text-sm text-muted-foreground mt-1">Мы отправим код подтверждения</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button className="flex-1" disabled={!email.includes("@")} onClick={() => setStep(3)}>
                  Отправить код <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Shield className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
                <h2 className="text-xl font-bold">Подтверждение</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Введите код из письма на {email}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button className="flex-1" disabled={code.length < 4} onClick={() => setStep(4)}>
                  Подтвердить <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Profile */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
                <h2 className="text-xl font-bold">Расскажите о себе</h2>
                <p className="text-sm text-muted-foreground mt-1">Контактная информация</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ФИО</Label>
                  <Input
                    id="name"
                    placeholder="Иванов Иван Иванович"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Наименование компании</Label>
                  <Input
                    id="company"
                    placeholder='ТОО "Компания"'
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    placeholder="+7 777 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button className="flex-1" disabled={!name} onClick={handleComplete}>
                  Завершить регистрацию
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
