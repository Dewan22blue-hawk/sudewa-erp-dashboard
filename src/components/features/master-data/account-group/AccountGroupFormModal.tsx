import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AccountGroupForm } from './AccountGroupForm';
import type { AccountGroupFormValues } from '@/scheme/account-group.schema';
import type { UseFormReturn } from 'react-hook-form';

interface AccountGroupFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<AccountGroupFormValues>;
    onSubmit: (values: AccountGroupFormValues) => void;
    title: string;
    description: string;
    isSubmitting?: boolean;
    submitLabel?: string;
}

export const AccountGroupFormModal = ({
    open,
    onOpenChange,
    form,
    onSubmit,
    title,
    description,
    isSubmitting = false,
    submitLabel = 'Simpan',
}: AccountGroupFormModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-md sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-0 bg-white p-0 shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b shrink-0 text-left">
                    <DialogTitle className="text-[18px] font-semibold text-[#171717]">{title}</DialogTitle>
                    <DialogDescription className="text-[15px] text-[#71717A]">{description}</DialogDescription>
                </DialogHeader>
                <AccountGroupForm form={form} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} submitLabel={submitLabel} />
            </DialogContent>
        </Dialog>
    );
};
