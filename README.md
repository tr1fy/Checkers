# ♟ Checkers — Современная платформа для игры в шашки

> Классическая игра. Современный опыт. Умный AI. Реальный мультиплеер.

## 🎯 О проекте

**Checkers** — это не просто доска с шашками. Это полноценный игровой сервис с социальным слоем, AI-тренером и монетизацией. Цель: создать продукт, который люди захотят использовать снова и снова.

### Для кого это?
- Для тех, кто хочет тренировать стратегическое мышление
- Для игроков, которые хотят играть с друзьями без необходимости скачивать приложение
- Для новичков, которые учатся играть в шашки с помощью AI-тренера

### Почему это ценно?
- **Бесплатно и без регистрации** для базового режима → низкий барьер входа
- **AI Coach** после каждой партии — уникальная обучающая функция
- **Мультиплеер по ссылке** — делитесь кодом и играйте с другом в 30 секунд
- **Pro подписка** (скины, аналитика) — путь к монетизации

---

## 🚀 Функционал

### Level "Сильный" ✅
- [x] Полные правила шашек: диагональные ходы, взятия, дамки, множественные прыжки
- [x] AI с 3 уровнями сложности (Minimax + Alpha-Beta Pruning, глубина 2/4/7)
- [x] История ходов с нотацией
- [x] Отмена хода (Undo)
- [x] Таймер партии
- [x] Подсветка возможных ходов
- [x] Адаптивный дизайн (mobile-friendly)
- [x] Тёмная тема

### Level "Великий" ✅
- [x] **Мультиплеер** — реальное время через Supabase Realtime (WebSockets)
- [x] **AI Coach** — анализ партии после окончания, подсказки об ошибках
- [x] **Глобальный лидерборд** с фильтром по городам
- [x] **Авторизация** — Supabase Auth (email/password)
- [x] **Upgrade to Pro** — кнопка монетизации с модальным окном (Stripe ready)
- [x] **Кастомные скины** для доски и шашек (4 борда × 4 скина = 16 комбинаций)
- [x] **Видео-интро** при первом посещении

---

## 🛠 Технологии

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Стили | Tailwind CSS v4 |
| Анимации | Framer Motion v12 |
| State | Zustand |
| Auth + DB | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSockets) |
| Деплой | Vercel |
| Иконки | Lucide React |

---

## 🧠 Архитектура AI

Алгоритм **Minimax с Alpha-Beta Pruning**:

- **Лёгкий**: глубина 2, 40% случайных ходов
- **Средний**: глубина 4, детерминированный поиск
- **Сложный**: глубина 7, полный перебор с отсечением

Функция оценки позиции учитывает:
- Материальное преимущество (дамка = 3× обычной шашки)
- Продвижение шашек к дамочному полю
- Контроль центра
- Защиту тыловой линии

---

## 📦 Установка

### 1. Клонировать репозиторий
```bash
git clone https://github.com/your-username/checkers.git
cd checkers
npm install
```

### 2. Настройка Supabase (для мультиплеера и авторизации)

1. Создайте проект на [supabase.com](https://supabase.com) (бесплатно)
2. В SQL Editor выполните скрипт из `supabase/schema.sql`
3. Скопируйте Project URL и anon key из Settings → API
4. Создайте `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Запуск
```bash
npm run dev
```

Открыть: [http://localhost:3000](http://localhost:3000)

---

## 🌍 Деплой на Vercel

```bash
npx vercel --prod
```

Добавьте переменные окружения в Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 💡 Бизнес-модель

| Уровень | Что включено |
|---------|-------------|
| **Free** | Все базовые режимы игры, 2 скина |
| **Pro ($4.99/мес)** | Neon/Crystal скины, расширенная аналитика, Pro-значок в рейтинге |

Кнопка "Upgrade to Pro" интегрирована в скин-селектор. Stripe подключается за 1 час.

---

## 📂 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing + видео-интро
│   ├── play/               # Игра (vs AI, local)
│   ├── multiplayer/        # Мультиплеер лобби + комнаты
│   ├── leaderboard/        # Таблица лидеров
│   └── auth/               # Авторизация
├── components/
│   ├── board/              # Board + Piece компоненты
│   ├── game/               # GamePanel, AICoach, WinScreen, SkinSelector
│   ├── intro/              # VideoIntro
│   ├── layout/             # Header
│   └── ui/                 # UpgradeModal
├── lib/
│   ├── checkers/           # engine.ts, ai.ts, coach.ts
│   └── supabase/           # client.ts, server.ts
├── stores/                 # gameStore.ts (Zustand)
└── types/                  # checkers.ts
```

---

Создан для nFactorial School Hackathon 2025 🚀
