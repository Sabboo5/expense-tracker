import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser } from '@/store/authSlice';
import { userService } from '@/services/userService';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CURRENCIES } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  currency: z.string(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const currencyOptions = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.code} - ${c.name} (${c.symbol})`,
}));

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', currency: user?.currency || 'USD' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await userService.updateProfile(data);
      dispatch(updateUser(updatedUser));
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await userService.changePassword(data);
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Member since {formatDate(user.createdAt, 'MMMM yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Personal Information
        </h3>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            required
            error={profileErrors.name?.message}
            {...registerProfile('name')}
          />
          <Input
            label="Email address"
            type="email"
            value={user?.email || ''}
            disabled
            hint="Email cannot be changed"
          />
          <Select
            label="Default currency"
            options={currencyOptions}
            error={profileErrors.currency?.message}
            {...registerProfile('currency')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isUpdatingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            required
            error={passwordErrors.newPassword?.message}
            hint="Min 6 characters with uppercase, lowercase, and a number"
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isChangingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50 p-6">
        <h3 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">
          Danger Zone
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
          Once you delete your account, all your data will be permanently removed and cannot be
          recovered.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => toast.error('Account deletion requires password confirmation - contact support')}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};
