import React, { useState, useEffect, useMemo } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Calendar, Clock, MessageSquare, AlertCircle, MoreVertical, ChevronLeft, ChevronRight, User, CalendarClock, ArrowRight, X, Stethoscope, Mail, Phone } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/contexts/DoctorContext';

const ITEMS_PER_PAGE = 6;

const AppointmentList = () => {
    const { user } = useAuth();
    const { isLoading, error, fetchAppointment, BookedAppointments } = usePatient();
    const [currentPage, setCurrentPage] = useState(1);
    const [chatOpen, setChatOpen] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState({});
    const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, appointmentId: null });

    const { doctors } = useDoctor();

    useEffect(() => {
        if (user?._id) {
            fetchAppointment(user._id).catch(console.error);
        }
    }, [user, fetchAppointment]);
    
    // Memoized sorted appointments
    const sortedAppointments = useMemo(() => {
        return [...BookedAppointments].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
    
            if (isNaN(dateA) || isNaN(dateB)) {
                console.error("Invalid date detected", { a, b });
                return 0; // Treat invalid dates as equal
            }
    
            return dateA - dateB;
        });
    }, [BookedAppointments]);
    

    const isAppointmentNow = (appointmentDate, appointmentTime) => {
        const now = new Date();
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        
        // Check if the appointment is today and within the current hour
        return (
            now.toDateString() === appointmentDateTime.toDateString() &&
            now.getHours() === appointmentDateTime.getHours()
        );
    };

    const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
    const paginatedAppointments = sortedAppointments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'completed':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleChat = (id) => {
        setChatOpen(chatOpen === id ? null : id);
        setChatMessage('');
    };

    const sendMessage = (id) => {
        if (chatMessage.trim()) {
            setChatHistory(prev => ({
                ...prev,
                [id]: [...(prev[id] || []), chatMessage]
            }));
            setChatMessage('');
        }
    };

    const handleReschedule = (appointmentId) => {
        setRescheduleDialog({ open: true, appointmentId });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-2xl text-orange-600 animate-pulse flex items-center">
                    <CalendarClock className="w-8 h-8 mr-3" />
                    Loading appointments...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-600 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    {error}
                </div>
            </div>
        );
    }

    if (sortedAppointments.length === 0) {
        return (
            <div className="bg-gradient-to-b from-orange-50 to-white">
                <div className="max-w-4xl mx-auto pt-16 px-4">
                    <div className="text-center">
                        <Calendar className="w-20 h-20 text-orange-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-orange-800 mb-4">No Appointments Found</h2>
                        <p className="text-orange-600 mb-8 max-w-md mx-auto">
                            You don't have any appointments scheduled. Would you like to book a new appointment?
                        </p>
                        <Link to="/doctor">
                            <Button 
                                variant="outline"
                                className="relative overflow-hidden px-8 py-2 rounded-full 
                                transition-all duration-300 transform hover:shadow-lg group"
                            >
                                <span className="relative z-10 flex items-center gap-5">
                                    <span>Schedule New Appointment</span>
                                    <ArrowRight className="group-hover:flex hidden transition duration-150" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-orange-800">Your Upcoming Appointments</h1>
                    <Link to="/doctor">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                            Book New
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {paginatedAppointments.map((appointment) => {
                        const doctor = doctors.find((doc) => doc._id === appointment.doctorId);
                        const canChat = isAppointmentNow(appointment.date, appointment.time);

                        return (
                            <div
                                key={appointment._id}
                                className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 
                                    transition-all duration-300 hover:shadow-md hover:border-orange-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <User className="w-5 h-5 text-orange-600" />
                                            <h3 className="font-semibold text-xl capitalize">
                                                Dr. {doctor ? `${doctor.FirstName} ${doctor.LastName}` : 'Unknown'}
                                            </h3> 
                                            <span className='text-sm italic text-gray-400'>{doctor.specialization}</span>
                                        </div>

                                        <div className="flex items-center space-x-6 text-sm">
                                            <div className="flex items-center space-x-2 text-lg font-semibold bg-gray-100 px-3 py-1 rounded-full">
                                                <Clock className="w-4 h-4" />
                                                <span>{appointment.time}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-lg font-semibold bg-gray-100 px-3 py-1 rounded-full" title='Date: MM/DD/YYYY'>
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.appointmentStatus)}`}>
                                            {appointment.appointmentStatus.charAt(0).toUpperCase() + appointment.appointmentStatus.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {canChat && appointment.appointmentStatus === 'confirmed' ? (
                                            <Button
                                                onClick={() => handleChat(appointment._id)}
                                                className="bg-orange-100 hover:bg-orange-200 text-orange-600"
                                                size="sm"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Chat
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-orange-100 hover:bg-orange-200 text-orange-600 cursor-not-allowed"
                                                size="sm"
                                                disabled
                                            >
                                               Chat will be available on time
                                            </Button>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => handleReschedule(appointment._id)}
                                                    className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                                >
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Reschedule
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {chatOpen === appointment._id && canChat && (
                                    <div className="mt-6 border-t border-orange-100 pt-6">
                                        <div className="bg-orange-50 rounded-xl p-4 h-48 overflow-y-auto mb-4">
                                            {(chatHistory[appointment._id] || []).map((msg, idx) => (
                                                <div key={idx} className="mb-3">
                                                    <p className="text-sm bg-white text-orange-800 p-3 rounded-lg inline-block shadow-sm">
                                                        {msg}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex space-x-3">
                                            <Input
                                                value={chatMessage}
                                                onChange={(e) => setChatMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                            />
                                            <Button
                                                onClick={() => sendMessage(appointment._id)}
                                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                            >
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <span className="text-sm text-orange-600 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Reschedule Dialog remains the same */}
            <Dialog
                open={rescheduleDialog.open}
                onOpenChange={() => setRescheduleDialog({ open: false, appointmentId: null })}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-orange-800">Reschedule Appointment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-700">New Date</label>
                            <Input
                                type="date"
                                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-700">New Time</label>
                            <Input
                                type="time"
                                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRescheduleDialog({ open: false, appointmentId: null })}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setRescheduleDialog({ open: false, appointmentId: null });
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AppointmentList;