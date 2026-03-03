import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin } from "lucide-react";

const items = [
  { id: 1, name: "Погрузчик Toyota 8FGU25", price: "4 500 000 ₸", location: "Алматы", condition: "Б/У", image: "🏗️" },
  { id: 2, name: "Контейнер 20 футов", price: "850 000 ₸", location: "Астана", condition: "Новый", image: "📦" },
  { id: 3, name: "Паллетная стеллажная система", price: "1 200 000 ₸", location: "Караганда", condition: "Б/У", image: "🏭" },
  { id: 4, name: "Рефрижераторный контейнер 40ft", price: "3 200 000 ₸", location: "Актау", condition: "Новый", image: "❄️" },
  { id: 5, name: "Гидравлическая тележка", price: "180 000 ₸", location: "Шымкент", condition: "Новый", image: "🔧" },
  { id: 6, name: "Весы платформенные 3 тонны", price: "450 000 ₸", location: "Атырау", condition: "Б/У", image: "⚖️" },
];

const MarketplacePage = () => (
  <AppLayout>
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Маркетплейс</h1>
          <p className="text-sm text-muted-foreground">Оборудование для логистики</p>
        </div>
        <Button>Разместить объявление</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-accent/50 flex items-center justify-center text-5xl">
              {item.image}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{item.condition}</Badge>
              </div>
              <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
              <p className="text-lg font-bold text-primary">{item.price}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {item.location}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <MessageCircle className="h-3 w-3 mr-1" /> Связаться
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default MarketplacePage;
