import User from '../Models/UserModel.js';
import Doctor from '../Models/DoctorModel.js';  // Assuming you want to fetch doctors
import Appointment from '../Models/Appointement.js';
// Update User
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { FirstName, LastName, age, gender, email, password, PhoneNo } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { FirstName, LastName, age, gender, email, password, PhoneNo },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Get User
export const getUser = async (req, res) => {
  // console.log('nm');
  
  const { userId } = req.params;
  console.log('mdskn',userId);
  

  try {
    // Get user by userId
    const user = await User.findById(userId);
    console.log('user,',user);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Send user details
    res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        age: user.age,
        gender: user.gender,
        email: user.email,
        role: user.role,
        PhoneNo: user.PhoneNo,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Get All Doctors
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found.' });
    }

    // Exclude sensitive fields like password before returning data
    users.forEach(user => user.password = undefined);  // Exclude password

    res.status(200).json({
      success: true,
      users, // Return the list of users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
}



export const BookAppointment = async (req, res) => {

  const {userId, doctorId, date, time } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
     
    const alreadyBooked = await Appointment.findOne({ userId,doctorId, date, time });
    if (alreadyBooked) {
      return res.status(400).json({ success: false, message: `Appointment already booked for ${date} and ${time}` });
    }

//  ensure the time is in IST
const appointmentStart = new Date(`${date}T${time}:00`);
const offset = 5.5 * 60 * 60 * 1000; // Convert 5.5 hours to milliseconds
// Add 1 hour to the start time to get the endtime
const endtime = new Date(appointmentStart.getTime() + 60 * 60 * 1000 +offset); // Add 1 hour (in milliseconds)


    // Create a new appointment
    const appointment = {
      userId,
      doctorId,
      date,
      time,
      chat:true, 
      endtime:endtime , // Assuming the appointment ends 1 hour after it starts
    };
    const newAppointment = await Appointment.create(appointment);
    await newAppointment.save();
    res.status(201).json({ success: true, message: 'Appointment booked successfully.', appointment: newAppointment });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
}