import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Briefcase, CreditCard, Loader2 } from 'lucide-react';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';
import { AuthService } from '@/features/auth/services/auth.service';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { data: profileData, isLoading, refetch } = useAuthMe();
    const user = profileData?.data;

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
            });
        }
    }, [user]);

    const initials =
        (user?.name || [user?.firstname, user?.lastname].filter(Boolean).join(' '))
            ?.split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'US';

    const displayName = user?.name || [user?.firstname, user?.lastname].filter(Boolean).join(' ') || '-';
    const roleName = user?.roles?.[0]?.name || user?.role || 'Admin Warehouse'; // Fallback to Admin Warehouse as per design if none
    const userIdDisplay = user?.username || `USR-000${user?.id}` || 'WJR-ADM00012';

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSubmitting(true);
        try {
            const updateData = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                name: `${formData.firstname} ${formData.lastname}`.trim(),
            };

            await AuthService.updateProfile(user.id, updateData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            refetch(); // Refresh the profile data
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-500">Ubah dan perbarui profile anda</p>
                </div>

                {/* Top Profile Card */}
                <Card>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E5E5E5] text-2xl font-bold text-gray-800">{initials}</div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                                <p className="text-[13px] text-slate-500 font-medium mb-3">{roleName}</p>
                                <div className="flex items-center gap-4 pt-2 text-[13px] text-slate-700 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="border border-slate-200 rounded p-0.5 shadow-sm text-slate-500">
                                            <CreditCard className="h-3.5 w-3.5" />
                                        </div>
                                        <span>{userIdDisplay}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="border border-slate-200 rounded p-0.5 shadow-sm text-slate-500">
                                            <Briefcase className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Wajira Morindo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant={isEditing ? 'outline' : 'default'} className={!isEditing ? 'bg-[#1e293b] hover:bg-slate-800 text-white shadow-sm' : ''} onClick={() => setIsEditing(!isEditing)} disabled={isSubmitting}>
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Personal Details Form Card */}
                <Card>
                    <CardHeader className="border-b border-slate-100 p-4 m-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Informasi Personal</CardTitle>
                        <CardDescription className="text-slate-500 text-[13px] mt-1">Perbarui detail informasi personal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstname" className="text-[13px] font-semibold text-slate-700">
                                    Nama Depan
                                </Label>
                                <Input
                                    id="firstname"
                                    placeholder="Masukkan nama depan"
                                    value={formData.firstname}
                                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                    disabled={!isEditing || isSubmitting}
                                    className="bg-white border-slate-200 text-[13px] shadow-sm"
                                />
                            </div>
                            <div className="space-y-2 mb-4">
                                <Label htmlFor="lastname" className="text-[13px] font-semibold text-slate-700">
                                    Nama Belakang
                                </Label>
                                <Input
                                    id="lastname"
                                    placeholder="Masukkan nama belakang"
                                    value={formData.lastname}
                                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                    disabled={!isEditing || isSubmitting}
                                    className="bg-white border-slate-200 text-[13px] shadow-sm"
                                />
                            </div>
                            <div className="space-y-2 mb-8">
                                <Label htmlFor="userId" className="text-[13px] font-semibold text-slate-700">
                                    User ID
                                </Label>
                                <Input id="userId" value={userIdDisplay} disabled className="bg-slate-50 border-slate-200 text-slate-400 text-[13px] shadow-sm cursor-not-allowed" />
                            </div>
                            <div className="space-y-2 ">
                                <Label htmlFor="role" className="text-[13px] font-semibold text-slate-700">
                                    Role
                                </Label>
                                <div className="relative">
                                    <Input id="role" value={roleName} disabled className="bg-slate-50 border-slate-200 text-slate-400 text-[13px] shadow-sm cursor-not-allowed pr-8" />
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m7 15 5 5 5-5" />
                                            <path d="m7 9 5-5 5 5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="m-4 flex justify-end">
                                <Button onClick={handleSave} disabled={isSubmitting} className="bg-[#1e293b] hover:bg-slate-800 text-white min-w-[120px]">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
