import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '13px',
          color: '#1a1a1a',
          background: '#ffffff',
          border: '1px solid #e9eaec',
          boxShadow: 'none',
          borderRadius: '6px',
        },
        classNames: {
          toast: "group toast",
          description: "text-[#9ca3af]",
          actionButton: "bg-[#7c3aed] text-white",
          cancelButton: "bg-[#f3f4f6] text-[#374151]",
          error: "!border-l-[3px] !border-l-[#dc2626]",
          success: "!border-l-[3px] !border-l-[#16a34a]",
          info: "!border-l-[3px] !border-l-[#3b82f6]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
