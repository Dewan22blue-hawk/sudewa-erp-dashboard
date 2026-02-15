import { User } from "@/@types/user.types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    data: User[]
    onEdit: (user: User) => void
    onDelete: (user: User) => void
}

export function UserTable({ data, onEdit, onDelete }: Props) {
    if (!data.length) {
        return (
            <div className="text-center py-6 text-sm text-muted-foreground">
                Tidak ada data
            </div>
        )
    }

    return (
        <div className="rounded-xl border">
            <table className="w-full text-sm">
                <thead className="bg-muted uppercase text-xs">
                    <tr>
                        <th className="p-3 text-left font-bold text-muted-foreground">User ID</th>
                        <th className="p-3 text-left font-bold text-muted-foreground">Nama Pengguna</th>
                        <th className="p-3 text-left font-bold text-muted-foreground">Role</th>
                        <th className="p-3 text-right font-bold text-muted-foreground">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(user => (
                        <tr key={user.id} className="border-t hover:bg-muted/50 transition-colors">
                            <td className="p-3">{user.userId}</td>
                            <td className="p-3">{user.name}</td>
                            <td className="p-3">{user.role}</td>
                            <td className="p-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(user)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => onDelete(user)}
                                        >
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
