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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <AccountGroupForm form={form} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} submitLabel={submitLabel} />
            </DialogContent>
        </Dialog>
    );
};
