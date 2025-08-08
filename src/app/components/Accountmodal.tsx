"use client";
import { FiX, FiUser, FiMail, FiCalendar, FiEdit, } from 'react-icons/fi';
import { useProfile } from '@/app/context/profileContext';

export default function MyAccountModal({ onClose }: { onClose: () => void }) {
  const { userDetails } = useProfile();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <FiUser size={40} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {userDetails?.firstName} {userDetails?.lastName}
            </h3>
            <p className="text-gray-500">{userDetails?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-sm text-gray-900">
                  {userDetails?.firstName} {userDetails?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{userDetails?.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-sm text-gray-900">
                  {formatDate(userDetails?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              onClick={() => {
                // You can link this to your settings modal if needed
                onClose();
              }}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FiEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}