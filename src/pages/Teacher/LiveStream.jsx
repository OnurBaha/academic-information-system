// React hook'ları, useRef ve React Router yönlendirme hook'unun içe aktarılması
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Canlı yayın / Ders anlatım panelinin bulunduğu bileşen
export default function TeacherLive() {
    const navigate = useNavigate()
    const { currentUser } = useSelector((state) => state.auth || {})

    // Bileşenin durum (state) yönetim tanımlamaları
    const [isMuted, setIsMuted] = useState(false) // Mikrofon kapalı/sessiz durumu
    const [isCameraOff, setIsCameraOff] = useState(false) // Kamera kapalı durumu
    const [activeTab, setActiveTab] = useState('webcam') // Aktif yayın türü sekmesi ('webcam', 'screen', 'whiteboard')
    
    const { liveChatMessages = [], liveParticipants = [], incomingChatQueue = [] } = useSelector((state) => state.teacher || {})

    // Canlı dersteki sohbet mesajları listesi
    const [chatMessages, setChatMessages] = useState(() => [...liveChatMessages])
    const [newMessage, setNewMessage] = useState('') // Gönderilecek yeni mesaj girdisi
    
    // Yayına katılan öğrencilerin ve durumlarının listesi
    const [participants, setParticipants] = useState(() => [...liveParticipants])
    const [streamDuration, setStreamDuration] = useState(0) // Saniye cinsinden canlı yayın süresi
    const [showEndModal, setShowEndModal] = useState(false) // Yayını bitirme onay penceresinin görünürlüğü
    const [whiteboardColor, setWhiteboardColor] = useState('#2563eb') // Beyaz tahta çizim rengi
    const [whiteboardLineWidth, setWhiteboardLineWidth] = useState(4) // Beyaz tahta çizim kalınlığı

    const [toast, setToast] = useState(null) // Toast bildirim durumu
    const showToast = (message, type) => {
        setToast({ message, type })
    }

    // Toast penceresini 4 saniye sonra kapatan efekt
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null)
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    // Beyaz tahtada çizim işlemleri için HTML5 Canvas referansları
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false) // Fare/kalem basılı tutularak çizim yapılıyor mu durumu



    // Yayının süresini her saniye bir artıran timer efekti
    useEffect(() => {
        const timer = setInterval(() => {
            setStreamDuration(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Belirli aralıklarla (12 saniyede bir) sohbete öğrenci sorularını simüle eden efekt
    useEffect(() => {
        let messageIndex = 0
        const interval = setInterval(() => {
            if (messageIndex < incomingChatQueue.length) {
                const msg = incomingChatQueue[messageIndex]
                const now = new Date()
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

                setChatMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + messageIndex,
                        student: msg.student,
                        text: msg.text,
                        time: timeStr
                    }
                ])

                // Randomly simulate student raising/lowering hand
                setParticipants(prev => prev.map(p => {
                    if (p.name === msg.student) {
                        return { ...p, handRaised: !p.handRaised }
                    }
                    return p
                }))

                messageIndex++
            } else {
                clearInterval(interval)
            }
        }, 12000) // every 12 seconds

        return () => clearInterval(interval)
    }, [])

    // Etkileşimli Beyaz Tahta (Canvas) bileşeni ilk açıldığında veya tab değiştiğinde boyutlandırma ve grid çizme
    useEffect(() => {
        if (activeTab === 'whiteboard' && canvasRef.current) {
            const canvas = canvasRef.current
            // Ekran çözünürlüğüne göre canvas çözünürlüğünü 2 katı yapıp ölçeklendirerek pikselleşmeyi önleme
            canvas.width = canvas.parentElement.offsetWidth * 2
            canvas.height = canvas.parentElement.offsetHeight * 2
            canvas.style.width = `${canvas.parentElement.offsetWidth}px`
            canvas.style.height = `${canvas.parentElement.offsetHeight}px`

            const context = canvas.getContext('2d')
            context.scale(2, 2)
            context.lineCap = 'round' // Çizgi uçlarını yuvarlak yap
            context.strokeStyle = whiteboardColor
            context.lineWidth = whiteboardLineWidth
            contextRef.current = context

            // Arka planı hafif gri tonla doldur ve kareli defter ızgarası çiz
            context.fillStyle = '#f8fafc'
            context.fillRect(0, 0, canvas.width, canvas.height)
            drawWhiteboardGrid(context, canvas.width, canvas.height)
        }
    }, [activeTab])

    // Renk veya kalem kalınlığı değiştiğinde canvas bağlamını (context) güncelleyen efekt
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = whiteboardColor
            contextRef.current.lineWidth = whiteboardLineWidth
        }
    }, [whiteboardColor, whiteboardLineWidth])

    // Beyaz tahtaya kareli defter görünümü veren yardımcı ızgara çizme fonksiyonu
    function drawWhiteboardGrid(ctx, w, h) {
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 0.5
        const gridSize = 30
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, h)
            ctx.stroke()
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(w, y)
            ctx.stroke()
        }
        // Çizim kalem ayarlarına geri dön
        ctx.strokeStyle = whiteboardColor
        ctx.lineWidth = whiteboardLineWidth
    }

    // Tahtada fare ile çizim yapmayı başlatan olay yöneticisi
    const startDrawing = ({ nativeEvent }) => {
        if (!contextRef.current) return
        const { offsetX, offsetY } = nativeEvent
        contextRef.current.beginPath()
        contextRef.current.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    // Fare hareket ettikçe çizgi çizen olay yöneticisi
    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !contextRef.current) return
        const { offsetX, offsetY } = nativeEvent
        contextRef.current.lineTo(offsetX, offsetY)
        contextRef.current.stroke()
    }

    // Çizim yapmayı bitiren olay yöneticisi (fare bırakıldığında veya canvas dışına çıkıldığında)
    const stopDrawing = () => {
        if (!contextRef.current) return
        contextRef.current.closePath()
        setIsDrawing(false)
    }

    // Beyaz tahtadaki tüm çizimleri silen ve ızgarayı yeniden oluşturan fonksiyon
    const clearWhiteboard = () => {
        if (!contextRef.current || !canvasRef.current) return
        const canvas = canvasRef.current
        contextRef.current.fillStyle = '#f8fafc'
        contextRef.current.fillRect(0, 0, canvas.width, canvas.height)
        drawWhiteboardGrid(contextRef.current, canvas.width, canvas.height)
    }

    // Saniye cinsinden süreyi SS:DD veya DD:SS formatında string'e çeviren yardımcı fonksiyon
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    // Eğitmen tarafından yazılan sohbet mesajını gönderen form olay yöneticisi
    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        setChatMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                student: currentUser?.name ? `${currentUser.name} (Eğitmen)` : 'Dr. Nazlı BAŞAK (Eğitmen)',
                text: newMessage,
                time: timeStr,
                isInstructor: true
            }
        ])
        setNewMessage('')
    }

    // End lesson and redirect to dashboard
    const handleEndLesson = () => {
        // Navigate with a success toast trigger
        navigate('/teacher/dashboard', { state: { streamEnded: true, duration: formatTime(streamDuration) } })
    }

    return (
        <section className="teacher-live-canvas">
            {/* Header bar */}
            <div className="teacher-live-header">
                <div className="live-header-left">
                    <div className="live-status-badge animate-pulse">
                        <span className="live-dot"></span>
                        CANLI YAYIN
                    </div>
                    <div>
                        <h2 className="live-title">Advanced React Context API</h2>
                        <p className="live-subtitle">Bilgisayar Mühendisliği · Canlı Ders Sınıfı A</p>
                    </div>
                </div>
                <div className="live-header-right">
                    <div className="live-metric-pill">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>{formatTime(streamDuration)}</span>
                    </div>
                    <div className="live-metric-pill text-emerald-500">
                        <span className="material-symbols-outlined">group</span>
                        <span>{participants.filter(p => p.status === 'active').length} İzleyici</span>
                    </div>
                    <button
                        className="live-btn-danger"
                        onClick={() => setShowEndModal(true)}
                    >
                        <span className="material-symbols-outlined">power_settings_new</span>
                        <span>Yayını Sonlandır</span>
                    </button>
                </div>
            </div>

            {/* Main split screen */}
            <div className="teacher-live-grid">

                {/* Left Column: Stream Screen Viewport */}
                <div className="live-viewport-container flex flex-col gap-4">

                    <div className="live-viewport-main bg-slate-950 flex-1 flex flex-col justify-between relative rounded-2xl overflow-hidden border border-slate-800">

                        {activeTab === 'webcam' && (
                            <div className="live-feed-mock webcam-mode relative flex-1 flex items-center justify-center min-h-[400px]">
                                {isCameraOff ? (
                                    <div className="camera-off-overlay text-center">
                                        <span className="material-symbols-outlined text-6xl text-slate-600">videocam_off</span>
                                        <p className="text-slate-400 mt-2 font-medium">Kameranız Kapalı</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 z-10">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Kamera Yayını Aktif
                                        </div>
                                        {/* Simulated Camera Video Feed */}
                                        <div className="webcam-simulated-video flex flex-col items-center justify-center">
                                            <div className="avatar-big-circle w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-blue-400/20">AY</div>
                                            <div className="sound-wave flex gap-1 items-end mt-6 h-8">
                                                <span className={`bar w-1.5 bg-blue-500 rounded-full animate-[soundWave_1.2s_ease-in-out_infinite] ${isMuted ? 'h-1 opacity-20' : 'h-6'}`}></span>
                                                <span className={`bar w-1.5 bg-blue-500 rounded-full animate-[soundWave_0.8s_ease-in-out_infinite_0.2s] ${isMuted ? 'h-1 opacity-20' : 'h-8'}`}></span>
                                                <span className={`bar w-1.5 bg-blue-500 rounded-full animate-[soundWave_1.5s_ease-in-out_infinite_0.4s] ${isMuted ? 'h-1 opacity-20' : 'h-5'}`}></span>
                                                <span className={`bar w-1.5 bg-blue-500 rounded-full animate-[soundWave_1s_ease-in-out_infinite_0.1s] ${isMuted ? 'h-1 opacity-20' : 'h-7'}`}></span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'screen' && (
                            <div className="live-feed-mock screen-mode relative flex-1 flex flex-col min-h-[400px]">
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 z-10">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Ekran Paylaşımı Aktif
                                </div>
                                {/* Simulated Screen share with code display */}
                                <div className="screen-share-simulated-content flex-1 overflow-auto bg-slate-900/90 flex flex-col justify-center">
                                    <pre className="code-editor-mock text-[12px] font-mono text-emerald-400 p-6 leading-relaxed select-none overflow-x-auto">
                                        {`import React, { createContext, useContext, useReducer } from 'react';

// 1. Create Context
const CourseContext = createContext(null);

// 2. Reducer Function for State Management
function courseReducer(state, action) {
  switch (action.type) {
    case 'START_STREAM':
      return { ...state, isLive: true, startTime: Date.now() };
    case 'END_STREAM':
      return { ...state, isLive: false };
    default:
      return state;
  }
}

export function CourseProvider({ children }) {
  const [state, dispatch] = useReducer(courseReducer, { isLive: false });
  return (
    <CourseContext.Provider value={{ state, dispatch }}>
      {children}
    </CourseContext.Provider>
  );
}`}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeTab === 'whiteboard' && (
                            <div className="live-feed-mock whiteboard-mode relative overflow-hidden flex-1 min-h-[400px] flex flex-col">
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 z-10">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Etkileşimli Beyaz Tahta (Öğrenciler Görebilir)
                                </div>

                                {/* Drawing Controls Panel */}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-slate-800 border border-slate-200 flex items-center gap-3 z-10 shadow-lg">
                                    <div className="flex gap-1.5">
                                        {['#2563eb', '#dc2626', '#16a34a', '#0f172a'].map(color => (
                                            <button
                                                key={color}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${whiteboardColor === color ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setWhiteboardColor(color)}
                                                title="Kalem Rengi"
                                            />
                                        ))}
                                    </div>
                                    <div className="h-6 w-px bg-slate-200"></div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            className={`p-1 rounded hover:bg-slate-100 flex items-center justify-center ${whiteboardLineWidth === 2 ? 'bg-slate-200 font-bold' : ''}`}
                                            onClick={() => setWhiteboardLineWidth(2)}
                                            title="İnce Kalem"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                                        </button>
                                        <button
                                            className={`p-1 rounded hover:bg-slate-100 flex items-center justify-center ${whiteboardLineWidth === 5 ? 'bg-slate-200 font-bold' : ''}`}
                                            onClick={() => setWhiteboardLineWidth(5)}
                                            title="Orta Kalem"
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                                        </button>
                                        <button
                                            className={`p-1 rounded hover:bg-slate-100 flex items-center justify-center ${whiteboardLineWidth === 10 ? 'bg-slate-200 font-bold' : ''}`}
                                            onClick={() => setWhiteboardLineWidth(10)}
                                            title="Kalın Kalem"
                                        >
                                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800"></span>
                                        </button>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200"></div>
                                    <button
                                        className="p-1 text-red-600 hover:bg-red-50 rounded flex items-center justify-center border-none cursor-pointer"
                                        onClick={clearWhiteboard}
                                        title="Tahtayı Temizle"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>

                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="cursor-crosshair w-full h-full block bg-slate-50 flex-1"
                                />
                            </div>
                        )}

                        {/* Control Bar Overlay (Sticky Bottom) */}
                        <div className="live-control-overlay-bar flex justify-between items-center p-4 bg-slate-900 border-t border-slate-800 z-10">

                            <div className="live-control-tabs flex gap-2">
                                <button
                                    className={`live-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all ${activeTab === 'webcam' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    onClick={() => setActiveTab('webcam')}
                                >
                                    <span className="material-symbols-outlined text-sm">videocam</span>
                                    <span>Kamera Yayını</span>
                                </button>
                                <button
                                    className={`live-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all ${activeTab === 'screen' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    onClick={() => setActiveTab('screen')}
                                >
                                    <span className="material-symbols-outlined text-sm">screen_share</span>
                                    <span>Ekran Paylaşımı</span>
                                </button>
                                <button
                                    className={`live-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all ${activeTab === 'whiteboard' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    onClick={() => setActiveTab('whiteboard')}
                                >
                                    <span className="material-symbols-outlined text-sm">draw</span>
                                    <span>Beyaz Tahta</span>
                                </button>
                            </div>

                            <div className="live-toolbar-actions flex gap-2">
                                <button
                                    className={`toolbar-btn w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'}`}
                                    onClick={() => setIsMuted(prev => !prev)}
                                    title={isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {isMuted ? 'mic_off' : 'mic'}
                                    </span>
                                </button>

                                <button
                                    className={`toolbar-btn w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition-all ${isCameraOff ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'}`}
                                    onClick={() => setIsCameraOff(prev => !prev)}
                                    title={isCameraOff ? 'Kamerayı Aç' : 'Kamerayı Kapat'}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {isCameraOff ? 'videocam_off' : 'videocam'}
                                    </span>
                                </button>

                                <button
                                    className="toolbar-btn w-9 h-9 rounded-full flex items-center justify-center border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 cursor-pointer"
                                    title="Yayın Ayarları"
                                    onClick={() => showToast('Yayın ayarları yükleniyor...', 'info')}
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                </button>
                            </div>

                        </div>

                    </div>

                    {/* Quick Stats Grid under viewport */}
                    <div className="live-sub-stats-grid grid grid-cols-3 gap-4">
                        <div className="sub-stat-card bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                            <span className="sub-stat-label text-xs font-semibold text-slate-400 uppercase tracking-wider">Yayın Kalitesi</span>
                            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-sm mt-1">
                                <span className="material-symbols-outlined text-lg">signal_cellular_alt</span>
                                <span>Mükemmel (1080p)</span>
                            </div>
                        </div>
                        <div className="sub-stat-card bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                            <span className="sub-stat-label text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif El Kaldıran</span>
                            <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm mt-1">
                                <span className="material-symbols-outlined text-lg">pan_tool</span>
                                <span>{participants.filter(p => p.handRaised).length} Öğrenci</span>
                            </div>
                        </div>
                        <div className="sub-stat-card bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                            <span className="sub-stat-label text-xs font-semibold text-slate-400 uppercase tracking-wider">Gecikme Süresi</span>
                            <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-sm mt-1">
                                <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                                <span>~1.2 sn (Düşük)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Chat and Participants */}
                <div className="live-sidepanel-container bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col h-[580px] max-h-[580px]">

                    {/* Tabs for Panel */}
                    <div className="sidepanel-tabs border-b border-slate-100 pb-3 flex gap-2">
                        <div className="sidepanel-tab-title active text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">forum</span>
                            <span>Canlı Sohbet ({chatMessages.length})</span>
                        </div>
                    </div>

                    <div className="sidepanel-tab-content flex-1 flex flex-col overflow-hidden pt-3">
                        {/* Live Chat area */}
                        <div className="live-chat-messages-container flex-1 overflow-y-auto flex flex-col gap-3 mb-3 pr-1">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`chat-message-bubble p-3 rounded-2xl text-xs max-w-[85%] ${msg.isInstructor ? 'instructor-message bg-blue-50 text-blue-900 self-end rounded-tr-none' : 'bg-slate-100 text-slate-800 self-start rounded-tl-none'}`}>
                                    <div className="chat-message-meta flex justify-between items-center gap-4 mb-1 font-bold">
                                        <span className="chat-student-name">{msg.student}</span>
                                        <span className="chat-time text-[10px] text-slate-400 font-normal">{msg.time}</span>
                                    </div>
                                    <p className="chat-text leading-relaxed whitespace-pre-line">{msg.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chat Send Form */}
                        <form onSubmit={handleSendMessage} className="live-chat-input-bar flex gap-2 border border-slate-200 rounded-xl p-1 mb-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Öğrencilere mesaj yazın..."
                                className="live-chat-input flex-1 border-none bg-transparent outline-none px-3 py-2 text-xs"
                            />
                            <button type="submit" className="live-chat-send-btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-8 h-8 flex items-center justify-center border-none cursor-pointer transition-all">
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </form>

                        <div className="h-px bg-slate-200 mb-3"></div>

                        {/* Participants list */}
                        <div className="participants-list-header flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Katılımcılar ({participants.length})</h4>
                        </div>

                        <div className="participants-scroller flex-1 overflow-y-auto pr-1">
                            {[...participants]
                                .sort((a, b) => (b.handRaised ? 1 : 0) - (a.handRaised ? 1 : 0))
                                .map(p => (
                                    <div key={p.id} className="participant-row flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            <span className="text-xs font-semibold text-slate-700">{p.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.handRaised && (
                                                <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 animate-bounce">
                                                    <span className="material-symbols-outlined text-[10px]">pan_tool</span>
                                                    El Kaldırdı
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer flex items-center justify-center"
                                                title="İletişime Geç"
                                                onClick={() => {
                                                    setChatMessages(prev => [
                                                        ...prev,
                                                        {
                                                            id: Date.now() + Math.random(),
                                                            student: currentUser?.name ? `${currentUser.name} (Eğitmen)` : 'Dr. Nazlı BAŞAK (Eğitmen)',
                                                            text: `@${p.name} Buyrun, dinliyorum sorunuzu.`,
                                                            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                                                            isInstructor: true
                                                        }
                                                    ])
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-xs">chat_bubble</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>

                    </div>

                </div>

            </div>

            {/* End Lesson Confirmation Modal */}
            {showEndModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <span className="material-symbols-outlined text-3xl">report_problem</span>
                            <h3 className="text-lg font-bold text-slate-800">Yayını Sonlandırmak İstiyor musunuz?</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Bu dersi bitirmek istediğinizden emin misiniz? Yayın durdurulacak, öğrencilerin bağlantısı kesilecek ve yoklama raporu otomatik olarak kaydedilecektir.
                        </p>
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm cursor-pointer bg-transparent transition-all"
                                onClick={() => setShowEndModal(false)}
                            >
                                Vazgeç
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm cursor-pointer border-none transition-all"
                                onClick={handleEndLesson}
                            >
                                Evet, Yayını Sonlandır
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
