import Citizen from '../models/Citizen.js';
import { sendComplaintStatusSMS, sendComplaintResolutionSMS, sendPriorityAlertSMS } from './smsService.js';
import { v4 as uuidv4 } from 'uuid';

// Add notification to citizen
export const addNotification = async (citizenId, notification) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const newNotification = {
      id: uuidv4(),
      ...notification,
      createdAt: new Date()
    };

    citizen.notifications.push(newNotification);
    await citizen.save();

    console.log(`📬 Notification added to citizen ${citizenId}: ${notification.title}`);
    return newNotification;
  } catch (error) {
    console.error('❌ Error adding notification:', error.message);
    throw error;
  }
};

// Send complaint status notification
export const sendComplaintStatusNotification = async (citizenId, complaintId, status, complaintTitle) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const statusMessages = {
      'Pending': 'Your complaint is pending review',
      'In Progress': 'Your complaint is now being processed',
      'Resolved': 'Your complaint has been resolved'
    };

    const notification = {
      type: 'complaint_status',
      title: 'Complaint Status Update',
      message: statusMessages[status] || `Your complaint status has been updated to ${status}`,
      complaintId: complaintId
    };

    // Add notification to database
    await addNotification(citizenId, notification);

    // Send SMS if phone number exists
    if (citizen.phone) {
      await sendComplaintStatusSMS(citizen.phone, complaintId, status, citizen.name);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error sending complaint status notification:', error.message);
    throw error;
  }
};

// Send complaint resolution notification
export const sendComplaintResolutionNotification = async (citizenId, complaintId, complaintTitle) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const notification = {
      type: 'complaint_resolved',
      title: 'Complaint Resolved',
      message: `Your complaint "${complaintTitle}" has been resolved! Please verify the resolution.`,
      complaintId: complaintId
    };

    // Add notification to database
    await addNotification(citizenId, notification);

    // Send SMS if phone number exists
    if (citizen.phone) {
      await sendComplaintResolutionSMS(citizen.phone, complaintId, citizen.name);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error sending complaint resolution notification:', error.message);
    throw error;
  }
};

// Send priority alert notification
export const sendPriorityAlertNotification = async (citizenId, complaintId, priority, complaintTitle) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const notification = {
      type: 'general',
      title: 'Priority Alert',
      message: `Your ${priority} priority complaint "${complaintTitle}" requires immediate attention.`,
      complaintId: complaintId
    };

    // Add notification to database
    await addNotification(citizenId, notification);

    // Send SMS if phone number exists
    if (citizen.phone) {
      await sendPriorityAlertSMS(citizen.phone, complaintId, priority, citizen.name);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error sending priority alert notification:', error.message);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (citizenId, notificationId) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const notification = citizen.notifications.find(n => n.id === notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await citizen.save();

    return notification;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error.message);
    throw error;
  }
};

// Get citizen notifications
export const getCitizenNotifications = async (citizenId, limit = 50) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    // Sort by creation date (newest first) and limit
    const notifications = citizen.notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return notifications;
  } catch (error) {
    console.error('❌ Error getting citizen notifications:', error.message);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (citizenId) => {
  try {
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    const unreadCount = citizen.notifications.filter(n => !n.isRead).length;
    return unreadCount;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error.message);
    throw error;
  }
};
