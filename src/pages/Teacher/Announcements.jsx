// React kütüphanesinden gerekli hook'ların içe aktarılması
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../store/teacher/teacherSlice'

// Akademisyen Duyuru ve İletişim Portalı bileşeni
export default function Announcements() {
  
  // Duyuruların tutulduğu başlangıç yerel state dizisi
  const dispatch = useDispatch()
  const announcements = useSelector(state => state.teacher.announcements || [])

  // Form girdileri için durum (state) yönetim tanımlamaları
  const [title, setTitle] = useState('') // Duyuru başlığı
  const [target, setTarget] = useState('Tüm Öğrenciler') // Hedef kitle (Tüm Sınıf, Grup A, Grup B vb.)
  const [priority, setPriority] = useState('Orta Öncelik') // Öncelik/Sabitleme durumu
  const [body, setBody] = useState('') // Duyuru detay içeriği
  const [isEditing, setIsEditing] = useState(null) // Düzenlenen duyurunun ID'si (null ise yeni kayıt modundadır)

  const [toast, setToast] = useState(null) // Toast bildirim durumu
  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Toast bildirim baloncuğunu 4 saniye sonra kapatan efekt
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Duyuru oluşturma veya güncelleme işlemini yapan form yöneticisi
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      showToast('Lütfen başlık ve içerik alanlarını doldurun.', 'info')
      return
    }

    if (isEditing) {
      // Eğer düzenleme modundaysa mevcut duyuruyu güncelle
      const existingAnn = announcements.find(ann => ann.id === isEditing)
      dispatch(updateAnnouncement({
        ...existingAnn,
        title,
        target,
        body,
        pinned: priority === 'Yüksek Öncelik'
      }))
      showToast('Duyuru başarıyla güncellendi.', 'success')
      setIsEditing(null)
    } else {
      // Düzenleme modunda değilse yeni duyuru oluştur ve listeye ekle
      const now = new Date()
      const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`
      const newAnn = {
        id: Date.now(),
        title,
        body,
        target,
        date: dateStr,
        pinned: priority === 'Yüksek Öncelik'
      }
      dispatch(addAnnouncement(newAnn))
      showToast('Duyuru başarıyla yayınlandı.', 'success')
    }

    // Form alanlarını sıfırla
    setTitle('')
    setTarget('Tüm Öğrenciler')
    setPriority('Orta Öncelik')
    setBody('')
  }

  // Düzenleme işlemini iptal eden ve form alanlarını temizleyen fonksiyon
  const handleCancel = () => {
    setTitle('')
    setTarget('Tüm Öğrenciler')
    setPriority('Orta Öncelik')
    setBody('')
    setIsEditing(null)
  }

  // Seçilen duyuruyu düzenleme moduna sokan ve form alanlarını dolduran fonksiyon
  const handleEdit = (ann) => {
    setTitle(ann.title)
    setTarget(ann.target)
    setPriority(ann.pinned ? 'Yüksek Öncelik' : 'Orta Öncelik')
    setBody(ann.body)
    setIsEditing(ann.id)
    showToast('Duyuru düzenleme moduna alındı.', 'info')

    // Formun bulunduğu en üst alana yumuşak bir kaydırma yap
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Seçilen duyuruyu listeden silen fonksiyon
  const handleDelete = (id) => {
    dispatch(deleteAnnouncement(id))
    showToast('Duyuru silindi.', 'info')
  }

  return (
    <section className="ann-page-canvas">
      <div className="ann-page-header">
        <h2 className="ann-page-title">Duyuru &amp; İletişim Portalı</h2>
        <button
          className="ann-btn-new"
          onClick={() => {
            handleCancel()
            document.querySelector('.ann-input-title')?.focus()
          }}
        >
          <span className="material-symbols-outlined">add</span>
          <span>Yeni Duyuru</span>
        </button>
      </div>

      <div className="ann-composer-card">
        <h4 className="ann-composer-title">{isEditing ? 'Duyuruyu Düzenle' : 'Duyuru Oluştur'}</h4>
        <form onSubmit={handleSubmit} className="ann-composer-form">
          <input
            className="ann-input-title"
            placeholder="Duyuru Başlığı..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="ann-select-row">
            <select
              className="ann-composer-select"
              value={target}
              onChange={e => setTarget(e.target.value)}
            >
              <option value="Tüm Öğrenciler">Tüm Öğrenciler</option>
              <option value="Grup A">Grup A</option>
              <option value="Grup B">Grup B</option>
            </select>
            <select
              className="ann-composer-select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="Düşük Öncelik">Düşük Öncelik</option>
              <option value="Orta Öncelik">Orta Öncelik</option>
              <option value="Yüksek Öncelik">Yüksek Öncelik</option>
            </select>
          </div>
          <textarea
            className="ann-textarea-body"
            placeholder="Duyuru içeriğini buraya yazın..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
          <div className="ann-btn-row">
            <button type="button" className="ann-btn-cancel" onClick={handleCancel}>İptal</button>
            <button type="submit" className="ann-btn-submit">{isEditing ? 'Güncelle' : 'Yayınla'}</button>
          </div>
        </form>
      </div>

      <div className="ann-list-container">
        {announcements.map(ann => {
          const cardClass = ann.pinned ? 'ann-pinned-card' : 'ann-normal-card'
          return (
            <div key={ann.id} className={cardClass}>
              <div className="ann-card-header">
                <div className="ann-title-wrap">
                  {ann.pinned && <span className="ann-badge-pinned">Sabitlendi</span>}
                  <h4 className="ann-card-title">{ann.title}</h4>
                </div>
                <div className="ann-actions-wrap">
                  <button className="ann-btn-edit" onClick={() => handleEdit(ann)}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="ann-btn-delete" onClick={() => handleDelete(ann.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <p className="ann-card-body">{ann.body}</p>
              <div className="ann-card-footer">
                <span className="ann-meta-item">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{ann.date}</span>
                </span>
                <span className="ann-meta-item">
                  <span className="material-symbols-outlined">group</span>
                  <span>{ann.target}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-xl bg-slate-900 text-slate-100 border-l-4 border-emerald-500 teacher-toast-notification font-medium text-sm">
          <span className="material-symbols-outlined text-emerald-500">
            {toast.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  )
}
