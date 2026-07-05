import { Link } from 'react-router-dom';

export default function FeaturedAcademicians({ instructors = [] }) {
  const defaultInstructors = [
    { name: 'Dr. Elif Soylu', dept: 'Tarih Bölümü', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80', status: 'active' },
    { name: 'Doç. Dr. Mert Akın', dept: 'Genel Cerrahi', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80', status: 'active' },
    { name: 'Dr. Cem Kaya', dept: 'Hukuk', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80', status: 'idle' },
    { name: 'Prof. Seda Demir', dept: 'Edebiyat', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80', status: 'active' },
    { name: 'Dr. Ahmet Yılmaz', dept: 'Mühendislik Fakültesi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', status: 'active' }
  ];

  const list = instructors.length > 0 ? instructors.slice(0, 5) : defaultInstructors;

  return (
    <div className="dean-featured-card">
      <div className="dean-featured-header">
        <h4 className="dean-featured-title">Öne Çıkan Akademisyenler</h4>
        <Link to="/dean/faculty" className="dean-featured-link">
          <span>Tüm Kadro</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>
      <div className="dean-featured-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {list.map((item, idx) => (
          <div className="dean-academician-item" key={idx}>
            <div className="dean-academician-avatar-wrap">
              {item.avatar && item.avatar.startsWith('http') ? (
                <img 
                  className="dean-academician-img" 
                  src={item.avatar} 
                  alt={item.name} 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#00236f] text-white flex items-center justify-center font-black text-sm uppercase">
                  {item.name?.charAt(0) || 'A'}
                </div>
              )}
              <span className={`dean-status-badge ${item.status === 'active' ? 'dean-status-active' : item.status === 'busy' ? 'dean-status-busy' : 'dean-status-idle'}`}></span>
            </div>
            <p className="dean-academician-name">{item.name}</p>
            <p className="dean-academician-role">{item.dept}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
