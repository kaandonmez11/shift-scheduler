import React from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import { MousePointerClick, CalendarDays } from 'lucide-react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      
      {/* Test Kurgusu - Ortalanmış Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        width: '100%'
      }}>

        {/* 1. Component Test Kartı: Butonlar */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
            <MousePointerClick size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Button.jsx Testi</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Üzerine geldiğinizde yayılan sıvı ışık efektini (fluid highlight) ve ince beyaz sınır belirginleşmesini test edin.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
             <Button>Standard Buton</Button>
             <Button style={{ background: 'var(--accent-primary)', color: 'white', borderColor: 'transparent' }}>
               Renkli Buton
             </Button>
          </div>
        </Card>

        {/* 2. Component Test Kartı: Card & Hover */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
           <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '1rem', borderRadius: '50%', color: '#c084fc' }}>
            <CalendarDays size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Card.jsx Testi</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Şu an zaten bir "Card" bileşeninin içindesiniz! Mouse imlecini kartın üzerine getirdiğinizde nasıl hafifçe havalandığını ve gölgesinin (shadow) derinleştiğini görebilirsiniz.
          </p>
        </Card>

        {/* 3. Component Test Kartı: Input */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center' }}>Input.jsx Testi</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
            Focus (tıklama) anındaki glow (parlama) efekti ve soft arkaplanını inceleyin.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <Input 
              id="ad" 
              label="Personel Adı" 
              placeholder="Örn: Ayşe Yılmaz" 
            />
            <Input 
              id="vardiya" 
              label="Vardiya Hedefi" 
              placeholder="Örn: 180 Saat" 
              type="number"
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

export default App;
