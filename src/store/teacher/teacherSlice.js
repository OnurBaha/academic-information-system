import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';
import teacherDb from '../../../teacher_db.json';

// Öğretmenin ders verdiği öğrencilerin notlarını asenkron olarak çeken thunk eylemi
export const fetchTeacherStudentsGradesAsync = createAsyncThunk(
    'teacher/fetchTeacherStudentsGradesAsync',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/studentGrades');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Belirli bir öğrencinin notunu (vize, final, proje) güncelleyen ve ortalama ile harf notunu hesaplayan thunk eylemi
export const updateStudentGradeAsync = createAsyncThunk(
    'teacher/updateStudentGradeAsync',
    async ({ gradeId, midterm, final, project, homeworkAverage }, { rejectWithValue }) => {
        try {
            const currentGrade = await apiFetch(`/studentGrades/${gradeId}`);

            // Eğer değer boş veya null ise null olarak ayarla, aksi halde sayıya çevir
            const updatedMidterm = midterm !== undefined ? (midterm === '' || midterm === null ? null : parseInt(midterm, 10)) : currentGrade.midterm;
            const updatedFinal = final !== undefined ? (final === '' || final === null ? null : parseInt(final, 10)) : currentGrade.final;
            const updatedProject = project !== undefined ? (project === '' || project === null ? null : parseInt(project, 10)) : currentGrade.project;

            let average = null;
            let letterGrade = null;

            // Eğer vize ve final notları girilmişse ortalama ve harf notunu hesapla (%25 vize, %25 proje, %15 ödev, %35 final)
            if (updatedMidterm !== null && updatedFinal !== null && updatedMidterm !== undefined && updatedFinal !== undefined) {
                const m = updatedMidterm || 0;
                const f = updatedFinal || 0;
                const p = updatedProject || 0;
                const hw = homeworkAverage !== undefined ? Number(homeworkAverage) : 0;
                average = Math.round((m * 0.25) + (p * 0.25) + (hw * 0.15) + (f * 0.35));

                if (average >= 90) letterGrade = 'AA';
                else if (average >= 80) letterGrade = 'BA';
                else if (average >= 70) letterGrade = 'BB';
                else if (average >= 60) letterGrade = 'CB';
                else if (average >= 50) letterGrade = 'CC';
                else if (average >= 45) letterGrade = 'DC';
                else letterGrade = 'FF';
            }

            // Sunucuda öğrenci not kaydını güncelle
            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    midterm: updatedMidterm,
                    final: updatedFinal,
                    project: updatedProject,
                    average,
                    letterGrade
                }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Öğrencinin yoklama durumunu güncelleyen thunk eylemi
export const updateAttendanceAsync = createAsyncThunk(
    'teacher/updateAttendanceAsync',
    async ({ gradeId, attendanceStatus }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({ attendanceStatus }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Öğretmen paneli ile ilgili durum yönetimini gerçekleştiren Redux dilimi (slice)
const db = teacherDb?.default || teacherDb || {};

const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        studentsGrades: [], // Öğrencilerin not bilgileri listesi
        selectedCourseId: null, // Seçilen dersin ID'si
        status: 'idle', // Veri yükleme durumu ('idle', 'loading', 'succeeded', 'failed')
        actionStatus: 'idle', // Not/yoklama güncelleme işlem durumu
        error: null, // Hata mesajı
        kpis: db.kpis || {},
        pastLessons: db.pastLessons || [],
        students: db.students || [],
        announcements: db.announcements || [],
        homeworkReviews: db.homeworkReviews || [],
        liveParticipants: db.liveParticipants || [],
        incomingChatQueue: db.incomingChatQueue || [],
        liveChatMessages: db.liveChatMessages || [],
        courses: [
            {
                code: 'WEB 307',
                name: 'Modern Web Geliştirme',
                homeworks: [
                    { id: 'hw-1', title: 'HTML5 & CSS3 Standartları', givenDate: '05.05.2026', dueDate: '12.05.2026', weight: 20 },
                    { id: 'hw-2', title: 'Modern Javascript (ES6+) & Asenkron Programlama', givenDate: '13.05.2026', dueDate: '20.05.2026', weight: 20 },
                    { id: 'hw-3', title: 'React Temelleri & Component Mimarisi', givenDate: '21.05.2026', dueDate: '28.05.2026', weight: 30 },
                    { id: 'hw-4', title: 'React Redux & Context API', givenDate: '29.05.2026', dueDate: '07.06.2026', weight: 30 }
                ]
            },
            {
                code: 'DBM 301',
                name: 'Veri Tabanı Yönetim Sistemleri',
                homeworks: [
                    { id: 'hw-1', title: 'SQL Sorgulama ve DDL/DML', givenDate: '10.05.2026', dueDate: '17.05.2026', weight: 30 },
                    { id: 'hw-2', title: 'Veri Tabanı Tasarımı ve Normalizasyon', givenDate: '18.05.2026', dueDate: '25.05.2026', weight: 35 },
                    { id: 'hw-3', title: 'İndeksleme ve Sorgu Optimizasyonu', givenDate: '26.05.2026', dueDate: '02.06.2026', weight: 35 }
                ]
            },
            {
                code: 'OPS 302',
                name: 'İşletim Sistemleri',
                homeworks: [
                    { id: 'hw-1', title: 'Süreç (Process) Zamanlama Algoritmaları', givenDate: '12.05.2026', dueDate: '19.05.2026', weight: 50 },
                    { id: 'hw-2', title: 'Bellek Yönetimi ve Paging Simülasyonu', givenDate: '20.05.2026', dueDate: '27.05.2026', weight: 50 }
                ]
            }
        ],
    },
    reducers: {
        // Seçilen dersin ID'sini güncelleyen reducer eylemi
        setSelectedCourseId: (state, action) => {
            state.selectedCourseId = action.payload;
        },
        addAnnouncement: (state, action) => {
            state.announcements.unshift(action.payload);
        },
        updateAnnouncement: (state, action) => {
            const index = state.announcements.findIndex(ann => ann.id === action.payload.id);
            if (index !== -1) {
                state.announcements[index] = action.payload;
            }
        },
        deleteAnnouncement: (state, action) => {
            state.announcements = state.announcements.filter(ann => ann.id !== action.payload);
        },
        approveHomework: (state, action) => {
            const index = state.homeworkReviews.findIndex(rev => rev.id === action.payload);
            if (index !== -1) {
                state.homeworkReviews[index].status = 'Onaylandı';
            }
        },
        addHomework: (state, action) => {
            const { courseCode, title, givenDate, dueDate, weight } = action.payload;
            const course = state.courses.find(c => c.code === courseCode);
            if (course) {
                const newId = `hw-${course.homeworks.length + 1}`;
                course.homeworks.unshift({
                    id: newId,
                    title,
                    givenDate,
                    dueDate,
                    weight: weight !== undefined ? Number(weight) : 0
                });
            }
        },
        updateHomeworkWeights: (state, action) => {
            const { courseCode, weights } = action.payload;
            const course = state.courses.find(c => c.code === courseCode);
            if (course) {
                course.homeworks.forEach(hw => {
                    if (weights[hw.id] !== undefined) {
                        hw.weight = Number(weights[hw.id]);
                    }
                });
            }
        },
        evaluateHomework: (state, action) => {
            const { id, studentId, courseCode, homeworkId, name, avatar, grade, feedback, status } = action.payload;
            let index = -1;
            if (id) {
                index = state.homeworkReviews.findIndex(rev => rev.id === id);
            } else if (studentId && courseCode && homeworkId) {
                index = state.homeworkReviews.findIndex(rev => 
                    rev.studentId === studentId && 
                    rev.courseCode === courseCode && 
                    rev.homeworkId === homeworkId
                );
            }

            if (index !== -1) {
                state.homeworkReviews[index].grade = grade;
                state.homeworkReviews[index].feedback = feedback;
                if (status) {
                    state.homeworkReviews[index].status = status;
                } else if (state.homeworkReviews[index].status === 'Bekliyor') {
                    state.homeworkReviews[index].status = 'İncelendi';
                }
            } else {
                const newId = state.homeworkReviews.length > 0 
                    ? Math.max(...state.homeworkReviews.map(r => r.id)) + 1 
                    : 1;
                state.homeworkReviews.push({
                    id: newId,
                    studentId,
                    courseCode,
                    homeworkId,
                    name: name || '',
                    avatar: avatar || (name ? name.charAt(0) : 'U'),
                    github: '',
                    time: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    status: status || 'İncelendi',
                    grade,
                    feedback
                });
            }
        },
        addLiveChatMessage: (state, action) => {
            state.liveChatMessages.push(action.payload);
        },
        toggleParticipantHandRaise: (state, action) => {
            const index = state.liveParticipants.findIndex(p => p.id === action.payload);
            if (index !== -1) {
                state.liveParticipants[index].handRaised = !state.liveParticipants[index].handRaised;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchTeacherStudentsGradesAsync durumları
            .addCase(fetchTeacherStudentsGradesAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTeacherStudentsGradesAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.studentsGrades = action.payload;
            })
            .addCase(fetchTeacherStudentsGradesAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // updateStudentGradeAsync durumları
            .addCase(updateStudentGradeAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateStudentGradeAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.studentsGrades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.studentsGrades[index] = action.payload;
                }
            })
            .addCase(updateStudentGradeAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })

            // updateAttendanceAsync durumları
            .addCase(updateAttendanceAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateAttendanceAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.studentsGrades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.studentsGrades[index].attendanceStatus = action.payload.attendanceStatus;
                }
            })
            .addCase(updateAttendanceAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    setSelectedCourseId,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    approveHomework,
    evaluateHomework,
    addLiveChatMessage,
    toggleParticipantHandRaise,
    addHomework,
    updateHomeworkWeights
} = teacherSlice.actions;
export default teacherSlice.reducer;
