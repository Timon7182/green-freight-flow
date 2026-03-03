import { AppLayout } from "@/components/AppLayout";
import { Calendar, ArrowRight } from "lucide-react";

const news = [
  { id: 1, title: "Новые тарифы на контейнерные перевозки", date: "03.03.2026", excerpt: "С 1 апреля вступают в силу обновлённые тарифы на контейнерные перевозки по территории Казахстана.", category: "Тарифы" },
  { id: 2, title: "Открытие нового склада в Караганде", date: "28.02.2026", excerpt: "Рады сообщить об открытии нового складского комплекса в г. Караганда для улучшения логистики.", category: "Новости" },
  { id: 3, title: "Обновление системы отслеживания грузов", date: "25.02.2026", excerpt: "Внедрена новая система GPS-отслеживания для всех перевозок через нашу платформу.", category: "Обновления" },
];

const NewsPage = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Новости</h1>
      <div className="space-y-4">
        {news.map((n) => (
          <article key={n.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">{n.category}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {n.date}
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{n.title}</h2>
            <p className="text-sm text-muted-foreground">{n.excerpt}</p>
            <div className="flex items-center gap-1 text-sm text-primary font-medium mt-3 group-hover:gap-2 transition-all">
              Читать далее <ArrowRight className="h-4 w-4" />
            </div>
          </article>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default NewsPage;
