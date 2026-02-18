# OMEGO Clone - Next.js & React

A stunning replica of the OMEGO freight management platform built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

✨ **Complete User Flow**
- 🏠 Landing page with hero section and features
- 🔍 Search page with shipping quote form
- ⏳ Loading state with animated illustration
- 📊 Results page with quotes and filters
- 📦 Booking summary with price breakdown
- 📱 Fully responsive design

🎨 **Modern UI/UX**
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Clean, professional design
- Interactive components
- Mobile-friendly navigation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment Ready**: Vercel, Netlify, etc.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   cd OMEGO-clone
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
OMEGO-clone/
├── src/
│   └── app/
│       ├── page.tsx           # Landing page
│       ├── search/
│       │   └── page.tsx       # Search form page
│       ├── results/
│       │   └── page.tsx       # Results with quotes
│       ├── booking/
│       │   └── page.tsx       # Booking summary
│       ├── layout.tsx         # Root layout
│       └── globals.css        # Global styles
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Pages Overview

### 1. Landing Page (`/`)
- Hero section with CTAs
- Feature cards (shipments, payments, credit)
- Navigation bar
- Footer with links

### 2. Search Page (`/search`)
- Shipping quote form with 4 inputs
- Origin, Destination, Load, Goods fields
- Search button with validation
- Feature cards below

### 3. Results Page (`/results`)
- Loading state (3 seconds) with animation
- Progress indicator
- Search summary bar
- Filter sidebar (price, date, type, modes)
- Quote cards with detailed info
- Ratings and provider details
- "Select" buttons for each quote

### 4. Booking Page (`/booking`)
- Booking summary
- Route visualization
- Load details
- Seller/Broker/Insurance info
- Price breakdown sidebar
- Total with "Continue to Payment" CTA

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```js
colors: {
  primary: {
    DEFAULT: '#1e3a8a',  // Navy blue
    dark: '#1e40af',
    light: '#3b82f6',
  },
  secondary: {
    DEFAULT: '#3dd5b4',  // Cyan/Teal
    dark: '#2ab89a',
    light: '#5ce1c6',
  },
}
```

### Content
- Update text in component files
- Modify feature cards
- Change quotes data
- Adjust form fields

## Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`

### Docker
```bash
docker build -t OMEGO-clone .
docker run -p 3000:3000 OMEGO-clone
```

## Features to Add (Optional)

- [ ] Backend API integration
- [ ] User authentication
- [ ] Database for quotes
- [ ] Payment processing
- [ ] Email notifications
- [ ] Real-time tracking
- [ ] Admin dashboard
- [ ] Analytics integration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Fast page loads with Next.js SSR
- Optimized images
- Code splitting
- Minimal bundle size
- SEO friendly

## Contributing

Feel free to submit issues and enhancement requests!

## License

This is a clone project for educational purposes.

## Credits

Original design: [OMEGO.com](https://www.OMEGO.com)
Built with ❤️ using Next.js & React

---

**Need Help?** Check the Next.js documentation or open an issue!
