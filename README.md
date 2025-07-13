# Al-Hidaya Platform 🕌

A comprehensive Islamic platform with stunning liquid glass design, featuring Quran, Hadith, Prayer Times, Qibla Direction, and more - available in 193 languages.

## ✨ Features

- **Quran**: Complete Quran with 50+ translations and tafsir
- **Hadith**: Access to 40,000+ authentic Hadith
- **Prayer Times**: Accurate prayer times with beautiful Adhan notifications
- **Qibla Direction**: Real-time Qibla compass
- **Islamic Calendar**: Hijri calendar with important dates
- **Zakat Calculator**: Calculate your Zakat easily
- **AI Chatbot**: Islamic knowledge assistant
- **193 Languages**: Full multilingual support

## 🎨 Design

- **Liquid Glass UI**: Modern glassmorphism design with fluid animations
- **Dark/Light Mode**: Beautiful themes optimized for reading
- **Responsive**: Perfect experience on all devices
- **Accessibility**: WCAG compliant

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/al-hidaya-platform.git
cd al-hidaya-platform
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3003
- Backend API: http://localhost:5001
- API Documentation: http://localhost:5001/docs

### Manual Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Framer Motion**: Animations
- **React Query**: Data fetching
- **i18next**: Internationalization

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **Docker**: Containerization
- **Nginx**: Reverse proxy

## 📁 Project Structure

```
al-hidaya-platform/
├── frontend/           # Next.js frontend
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities
│   └── public/       # Static assets
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── tests/        # Test files
│   └── migrations/   # Database migrations
├── nginx/            # Nginx configuration
└── docker-compose.yml # Docker orchestration
```

## 🌍 Language Support

The platform supports 193 languages including:
- Arabic (العربية)
- English
- French (Français)
- Spanish (Español)
- Turkish (Türkçe)
- Urdu (اردو)
- Indonesian (Bahasa Indonesia)
- And many more...

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://alhidaya:alhidaya123@localhost:5432/alhidaya_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 📱 Mobile Apps

Coming soon:
- iOS App
- Android App
- Desktop App (Windows, macOS, Linux)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Quran and Hadith data from authenticated sources
- Islamic geometric patterns inspired by traditional art
- Community contributors and translators

## 📞 Support

- Documentation: [docs.al-hidaya.com](https://docs.al-hidaya.com)
- Email: support@al-hidaya.com
- Discord: [Join our community](https://discord.gg/al-hidaya)

---

Made with ❤️ for the Muslim Ummah