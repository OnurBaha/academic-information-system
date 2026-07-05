import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';
import { calculateScore, getLetterGrade } from '../../utils/studentCalc';

// Async Thunks
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

export const updateStudentGradeAsync = createAsyncThunk(
    'teacher/updateStudentGradeAsync',
    async ({ gradeId, midterm, final, project, homeworkAverage }, { rejectWithValue }) => {
        try {
            const currentGrade = await apiFetch(`/studentGrades/${gradeId}`);

            const updatedMidterm = midterm !== undefined ? (midterm === '' || midterm === null ? null : parseInt(midterm, 10)) : currentGrade.midterm;
            const updatedFinal = final !== undefined ? (final === '' || final === null ? null : parseInt(final, 10)) : currentGrade.final;
            const updatedProject = project !== undefined ? (project === '' || project === null ? null : parseInt(project, 10)) : currentGrade.project;

            let average = null;
            let letterGrade = null;

            if (updatedMidterm !== null && updatedFinal !== null && updatedMidterm !== undefined && updatedFinal !== undefined) {
                const hw = homeworkAverage !== undefined ? Number(homeworkAverage) : 0;
                // Use shared calculateScore + getLetterGrade so teacher & student see identical result
                const score = calculateScore(updatedMidterm, updatedFinal, updatedProject, hw);
                average = Math.round(score);
                letterGrade = getLetterGrade(score);
            }

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

export const updateAttendanceAsync = createAsyncThunk(
    'teacher/updateAttendanceAsync',
    async ({ gradeId, attendanceStatus }, { rejectWithValue }) => {
        try {
            const currentGrade = await apiFetch(`/studentGrades/${gradeId}`);
            const totalWeeks = 14; // Toplam ders haftası

            let absentDates = Array.isArray(currentGrade.absentDates) ? [...currentGrade.absentDates] : [];

            if (attendanceStatus === 'Yok') {
                // Bugünün tarihini dd.mm.yyyy formatında ekle (tekrar ekleme)
                const now = new Date();
                const todayStr = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
                if (!absentDates.includes(todayStr)) {
                    absentDates.push(todayStr);
                }
            } else if (attendanceStatus === 'Mevcut') {
                // Mevcut işaretlenirse bugünü listeden kaldır
                const now = new Date();
                const todayStr = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
                absentDates = absentDates.filter(d => d !== todayStr);
            }

            const absencePercentage = Math.round((absentDates.length / totalWeeks) * 100);

            return await apiFetch(`/studentGrades/${gradeId}`, {
                method: 'PATCH',
                body: JSON.stringify({ attendanceStatus, absentDates, absencePercentage }),
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTeacherDashboardDataAsync = createAsyncThunk(
    'teacher/fetchTeacherDashboardDataAsync',
    async (_, { rejectWithValue }) => {
        try {
            const [
                courses, homeworkReviews, pastLessons, liveParticipants,
                incomingChatQueue, liveChatMessages, announcements, users, bulletins, studentsGrades
            ] = await Promise.all([
                apiFetch('/courses'),
                apiFetch('/homeworkReviews'),
                apiFetch('/pastLessons'),
                apiFetch('/liveParticipants'),
                apiFetch('/incomingChatQueue'),
                apiFetch('/liveChatMessages'),
                apiFetch('/announcements'),
                apiFetch('/users'),
                apiFetch('/bulletins'),
                apiFetch('/studentGrades')
            ]);
            return {
                courses, homeworkReviews, pastLessons, liveParticipants,
                incomingChatQueue, liveChatMessages, announcements, users, bulletins, studentsGrades
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addAnnouncement = createAsyncThunk(
    'teacher/addAnnouncement',
    async (announcementPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/announcements', {
                method: 'POST',
                body: JSON.stringify({
                    id: `ann-${Date.now()}`,
                    pinned: false,
                    date: new Date().toLocaleDateString('tr-TR'),
                    ...announcementPayload
                })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAnnouncement = createAsyncThunk(
    'teacher/updateAnnouncement',
    async (payload, { rejectWithValue }) => {
        try {
            const { id, ...data } = payload;
            return await apiFetch(`/announcements/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAnnouncement = createAsyncThunk(
    'teacher/deleteAnnouncement',
    async (id, { rejectWithValue }) => {
        try {
            await apiFetch(`/announcements/${id}`, {
                method: 'DELETE'
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const evaluateHomework = createAsyncThunk(
    'teacher/evaluateHomework',
    async ({ id, studentId, courseCode, homeworkId, name, avatar, grade, feedback, status }, { rejectWithValue }) => {
        try {
            let reviewId = id;
            if (!reviewId) {
                const reviews = await apiFetch('/homeworkReviews');
                const existing = reviews.find(r => r.studentId === studentId && r.courseCode === courseCode && r.homeworkId === homeworkId);
                if (existing) {
                    reviewId = existing.id;
                }
            }

            let result;
            if (reviewId) {
                result = await apiFetch(`/homeworkReviews/${reviewId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        grade: grade !== '' && grade !== null && grade !== undefined ? Number(grade) : '',
                        feedback,
                        status: status || 'İncelendi'
                    })
                });
            } else {
                result = await apiFetch('/homeworkReviews', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: `rev-${Date.now()}`,
                        studentId,
                        courseCode,
                        homeworkId,
                        studentName: name,
                        avatar,
                        grade: grade !== '' && grade !== null && grade !== undefined ? Number(grade) : '',
                        feedback,
                        status: status || 'İncelendi',
                        submittedAt: new Date().toLocaleDateString('tr-TR') + ' - 12:00'
                    })
                });
            }

            // Sync with studentGrades!
            try {
                const [allReviews, allCourses, allGrades] = await Promise.all([
                    apiFetch('/homeworkReviews'),
                    apiFetch('/courses'),
                    apiFetch('/studentGrades')
                ]);

                const gradeRec = allGrades.find(g => g.studentId === studentId && g.courseCode === courseCode);
                if (gradeRec) {
                    const course = allCourses.find(c => c.code === courseCode);
                    if (course && Array.isArray(course.homeworks) && course.homeworks.length > 0) {
                        const updatedReviews = allReviews.map(r => {
                            if (r.studentId === studentId && r.courseCode === courseCode && r.homeworkId === homeworkId) {
                                return { ...r, grade: grade !== '' && grade !== null && grade !== undefined ? Number(grade) : '' };
                            }
                            return r;
                        });

                        const exists = allReviews.some(r => r.studentId === studentId && r.courseCode === courseCode && r.homeworkId === homeworkId);
                        if (!exists) {
                            updatedReviews.push({ studentId, courseCode, homeworkId, grade: grade !== '' && grade !== null && grade !== undefined ? Number(grade) : '' });
                        }

                        let weightedScoreSum = 0;
                        let totalWeight = 0;
                        let gradedCount = 0;

                        course.homeworks.forEach(hw => {
                            const rev = updatedReviews.find(r => r.studentId === studentId && r.courseCode === courseCode && r.homeworkId === hw.id);
                            let hGrade = 0;
                            if (rev && rev.grade !== '' && rev.grade !== undefined && rev.grade !== null) {
                                hGrade = Number(rev.grade);
                                gradedCount++;
                            }
                            const weight = hw.weight !== undefined ? Number(hw.weight) : 0;
                            weightedScoreSum += hGrade * weight;
                            totalWeight += weight;
                        });

                        let homeworkAvg = 0;
                        if (totalWeight > 0) {
                            homeworkAvg = weightedScoreSum / totalWeight;
                        } else if (gradedCount > 0) {
                            homeworkAvg = weightedScoreSum / gradedCount;
                        }
                        homeworkAvg = Math.round(homeworkAvg * 10) / 10;

                        if (gradeRec.midterm !== null && gradeRec.final !== null && gradeRec.midterm !== undefined && gradeRec.final !== undefined) {
                            const score = calculateScore(gradeRec.midterm, gradeRec.final, gradeRec.project ?? gradeRec.proje, homeworkAvg);
                            const average = Math.round(score);
                            const letterGrade = getLetterGrade(score);

                            await apiFetch(`/studentGrades/${gradeRec.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({
                                    average,
                                    letterGrade
                                })
                            });
                        }
                    }
                }
            } catch (syncErr) {
                console.error("Error syncing studentGrades in evaluateHomework:", syncErr);
            }

            return result;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addHomework = createAsyncThunk(
    'teacher/addHomework',
    async ({ courseCode, homeworkPayload }, { rejectWithValue }) => {
        try {
            const courses = await apiFetch('/courses');
            const course = courses.find(c => c.code === courseCode);
            if (!course) throw new Error('Course not found');

            const homeworks = course.homeworks || [];
            const newId = `hw-${homeworks.length + 1}`;
            const updatedHomeworks = [
                {
                    id: newId,
                    ...homeworkPayload,
                    weight: Number(homeworkPayload.weight)
                },
                ...homeworks
            ];

            return await apiFetch(`/courses/${course.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ homeworks: updatedHomeworks })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateHomeworkWeights = createAsyncThunk(
    'teacher/updateHomeworkWeights',
    async ({ courseCode, weights }, { rejectWithValue }) => {
        try {
            const courses = await apiFetch('/courses');
            const course = courses.find(c => c.code === courseCode);
            if (!course) throw new Error('Course not found');

            const updatedHomeworks = (course.homeworks || []).map(hw => {
                if (weights[hw.id] !== undefined) {
                    return { ...hw, weight: Number(weights[hw.id]) };
                }
                return hw;
            });

            return await apiFetch(`/courses/${course.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ homeworks: updatedHomeworks })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const submitTeacherCourseRequestAsync = createAsyncThunk(
    'teacher/submitTeacherCourseRequestAsync',
    async (requestPayload, { rejectWithValue }) => {
        try {
            return await apiFetch('/courseAssignments', {
                method: 'POST',
                body: JSON.stringify({
                    id: `ca-${Date.now()}`,
                    ...requestPayload,
                    status: 'pending'
                })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Teacher Slice
const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        studentsGrades: [],
        courses: [],
        announcements: [],
        homeworkReviews: [],
        pastLessons: [],
        liveParticipants: [],
        incomingChatQueue: [],
        liveChatMessages: [],
        bulletins: [],
        users: [],
        kpis: {
            totalStudents: 0,
            unreadHomework: 0,
            attendanceAverage: 0,
            completedLiveLessons: "0 Saat"
        },
        selectedCourseId: null,
        status: 'idle',
        actionStatus: 'idle',
        error: null
    },
    reducers: {
        setSelectedCourseId: (state, action) => {
            state.selectedCourseId = action.payload;
        },
        addLiveChatMessage: (state, action) => {
            state.liveChatMessages.push(action.payload);
        },
        toggleParticipantHandRaise: (state, action) => {
            const index = state.liveParticipants.findIndex(p => p.id === action.payload);
            if (index !== -1) {
                state.liveParticipants[index].handRaised = !state.liveParticipants[index].handRaised;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchTeacherStudentsGradesAsync
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

            // updateStudentGradeAsync
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

            // updateAttendanceAsync
            .addCase(updateAttendanceAsync.pending, (state) => {
                state.actionStatus = 'loading';
                state.error = null;
            })
            .addCase(updateAttendanceAsync.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                const index = state.studentsGrades.findIndex((g) => g.id === action.payload.id);
                if (index !== -1) {
                    state.studentsGrades[index].attendanceStatus = action.payload.attendanceStatus;
                    state.studentsGrades[index].absentDates = action.payload.absentDates;
                    state.studentsGrades[index].absencePercentage = action.payload.absencePercentage;
                }
            })
            .addCase(updateAttendanceAsync.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.error = action.payload;
            })

            // fetchTeacherDashboardDataAsync
            .addCase(fetchTeacherDashboardDataAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTeacherDashboardDataAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.courses = action.payload.courses;
                state.homeworkReviews = action.payload.homeworkReviews;
                state.pastLessons = action.payload.pastLessons;
                state.liveParticipants = action.payload.liveParticipants;
                state.incomingChatQueue = action.payload.incomingChatQueue;
                state.liveChatMessages = action.payload.liveChatMessages;
                state.announcements = action.payload.announcements;
                state.users = action.payload.users;
                state.bulletins = action.payload.bulletins;
                state.studentsGrades = action.payload.studentsGrades;
            })
            .addCase(fetchTeacherDashboardDataAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // addAnnouncement
            .addCase(addAnnouncement.fulfilled, (state, action) => {
                state.announcements.unshift(action.payload);
            })

            // updateAnnouncement
            .addCase(updateAnnouncement.fulfilled, (state, action) => {
                const index = state.announcements.findIndex(ann => ann.id === action.payload.id);
                if (index !== -1) {
                    state.announcements[index] = action.payload;
                }
            })

            // deleteAnnouncement
            .addCase(deleteAnnouncement.fulfilled, (state, action) => {
                state.announcements = state.announcements.filter(ann => ann.id !== action.payload);
            })

            // evaluateHomework
            .addCase(evaluateHomework.fulfilled, (state, action) => {
                const index = state.homeworkReviews.findIndex(rev => rev.id === action.payload.id);
                if (index !== -1) {
                    state.homeworkReviews[index] = action.payload;
                } else {
                    state.homeworkReviews.unshift(action.payload);
                }
            })

            // addHomework
            .addCase(addHomework.fulfilled, (state, action) => {
                const index = state.courses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
            })

            // updateHomeworkWeights
            .addCase(updateHomeworkWeights.fulfilled, (state, action) => {
                const index = state.courses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
            });
    }
});

export const {
    setSelectedCourseId,
    addLiveChatMessage,
    toggleParticipantHandRaise
} = teacherSlice.actions;

export default teacherSlice.reducer;
