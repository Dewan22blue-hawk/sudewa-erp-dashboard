import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
    Loader2, 
    Upload, 
    Mail, 
    Shield 
} from 'lucide-react';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';
import { AuthService } from '@/features/auth/services/auth.service';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { data: profileData, isLoading, refetch } = useAuthMe();
    const user = profileData?.data;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State (name and username are editable as per update API body)
    const [formData, setFormData] = useState({
        name: '',
        username: '',
    });

    // Avatar upload states
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
            });
            // Reset local avatar selection when user data changes/reloads
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    }, [user]);

    // Clean up object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const initials = (user?.name || '-')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'US';

    const roleName = user?.roles?.[0]?.name 
        ? user.roles[0].name.charAt(0).toUpperCase() + user.roles[0].name.slice(1)
        : 'User';

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        if (!formData.name.trim()) {
            toast.error('Nama tidak boleh kosong');
            return;
        }
        if (!formData.username.trim()) {
            toast.error('Username tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData = {
                name: formData.name.trim(),
                username: formData.username.trim(),
                avatar: avatarFile,
            };

            await AuthService.updateProfile(user.id, updateData);
            toast.success('Profil berhasil diperbarui!');
            refetch(); // Refresh the profile data
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui profil');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
                    <p className="text-sm text-slate-500">Kelola dan perbarui detail informasi profil Anda.</p>
                </div>

                <Card className="border-slate-200 shadow-md">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Detail Pengguna</CardTitle>
                        <CardDescription>Informasi profil pribadi Anda di dalam sistem.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            
                            {/* Avatar Upload Section */}
                            <div className="flex flex-col items-center space-y-4 pb-4">
                                <div className="relative group">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Avatar Preview" 
                                            className="h-28 w-28 rounded-full object-cover border-4 border-slate-200 shadow-sm" 
                                        />
                                    ) : user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt="User Avatar" 
                                            className="h-28 w-28 rounded-full object-cover border-4 border-slate-200 shadow-sm" 
                                        />
                                    ) : (
                                        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-100 text-3xl font-bold text-slate-800 shadow-sm">
                                            {initials}
                                        </div>
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="h-6 w-6 text-white animate-pulse" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                setAvatarFile(file);
                                                if (file) {
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                } else {
                                                    setAvatarPreview(null);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Drag/Click File Uploader Box inspired by KasHarianForm */}
                                <label className="flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center hover:bg-slate-100/70 transition">
                                    <Upload className="mb-2 h-5 w-5 text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-700">
                                        {avatarFile ? avatarFile.name : 'Klik untuk ganti foto profil'}
                                    </span>
                                    <span className="mt-1 text-[10px] text-slate-400">Format PNG, JPG maksimal 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] ?? null;
                                            setAvatarFile(file);
                                            if (file) {
                                                setAvatarPreview(URL.createObjectURL(file));
                                            } else {
                                                setAvatarPreview(null);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100 pt-4" />

                            {/* Vertical Form Fields */}
                            <div className="space-y-5">
                                {/* Editable Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={isSubmitting}
                                        className="bg-white border-slate-200 text-sm shadow-sm h-11 focus-visible:ring-slate-400 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                                        Username <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        placeholder="Masukkan username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={isSubmitting}
                                        className="bg-white border-slate-200 text-sm shadow-sm h-11 focus-visible:ring-slate-400 rounded-xl"
                                    />
                                </div>

                                {/* Read-Only User-Understandable Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                        Alamat Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user?.email || '-'}
                                            disabled
                                            className="bg-slate-50 border-slate-200 text-slate-500 text-sm shadow-sm h-11 cursor-not-allowed pl-10 rounded-xl"
                                        />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname" className="text-sm font-semibold text-slate-700">
                                            Nama Depan
                                        </Label>
                                        <Input
                                            id="firstname"
                                            value={user?.firstname || '-'}
                                            disabled
                                            className="bg-slate-50 border-slate-200 text-slate-500 text-sm shadow-sm h-11 cursor-not-allowed rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname" className="text-sm font-semibold text-slate-700">
                                            Nama Belakang
                                        </Label>
                                        <Input
                                            id="lastname"
                                            value={user?.lastname || '-'}
                                            disabled
                                            className="bg-slate-50 border-slate-200 text-slate-500 text-sm shadow-sm h-11 cursor-not-allowed rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                                        Hak Akses / Role
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="role"
                                            value={roleName}
                                            disabled
                                            className="bg-slate-50 border-slate-200 text-slate-500 text-sm shadow-sm h-11 cursor-not-allowed pl-10 rounded-xl"
                                        />
                                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px] h-11 shadow-sm px-6 rounded-xl cursor-pointer font-medium"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
