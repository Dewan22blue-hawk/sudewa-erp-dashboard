export default function RequiredMark({ className = "" }) {
    return (
        <span className={`text-red-500 font-bold ${className}`}>
            *
        </span>
    );
}