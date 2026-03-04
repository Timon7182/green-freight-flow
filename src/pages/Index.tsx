import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Shield, Globe, ArrowRight, CheckCircle2, Package } from "lucide-react";

const services = [
  { icon: Package, title: "Сборный груз", desc: "Доставка мелких партий из Китая с консолидацией на нашем складе" },
  { icon: Truck, title: "Контейнер (FCL)", desc: "Полная загрузка контейнера с забором от завода в Китае" },
  { icon: Truck, title: "Авто фура (FTL)", desc: "Полная загрузка автофуры с доставкой до двери" },
  { icon: Globe, title: "5 складов в Китае", desc: "Гуанчжоу, Иу, Шанхай, Пекин, Шэньчжэнь — выберите ближайший" },
];

const advantages = [
  "Белая доставка с полным пакетом документов",
  "Персональный менеджер для каждой заявки",
  "Доставка в Казахстан, Россию, Узбекистан, Кыргызстан и другие страны",
  "Отслеживание груза в реальном времени",
  "Прозрачное ценообразование без скрытых комиссий",
  "Работа с юридическими и физическими лицами",
];

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (role === "manager" || role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/client/dashboard", { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="JJ" className="h-8 w-8 object-contain" />
            <span className="font-bold text-xl">JJ</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Войти</Button>
            <Button onClick={() => navigate("/auth")}>Начать <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Доставка грузов<br />
            <span className="text-primary">из Китая</span> — просто
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Сборные грузы, контейнеры и фуры. Полный пакет документов, персональный менеджер и отслеживание на каждом этапе.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8">
              Оставить заявку <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Наши услуги</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 space-y-3">
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Почему JJ?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {advantages.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geography */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">География доставки</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["🇰🇿 Казахстан", "🇷🇺 Россия", "🇺🇿 Узбекистан", "🇰🇬 Кыргызстан", "🇧🇾 Беларусь", "🇹🇲 Туркменистан", "🇹🇯 Таджикистан", "🇬🇪 Грузия", "🇰🇷 Южная Корея", "🇹🇭 Таиланд"].map(c => (
              <span key={c} className="bg-card border rounded-full px-4 py-2 text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-muted-foreground mb-8">Зарегистрируйтесь и отправьте первую заявку за 5 минут</p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8">
            Создать аккаунт <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="JJ" className="h-5 w-5 object-contain" />
            <span>JJ Logistics</span>
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
