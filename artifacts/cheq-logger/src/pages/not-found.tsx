import { MdErrorOutline } from "react-icons/md";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-[8px] border border-[#BBBBBB] shadow-sm text-center">
        <MdErrorOutline className="h-12 w-12 text-[#d72714] mx-auto mb-4" />
        <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c] mb-2">
          404 Page Not Found
        </h2>
        <p className="text-[#3d3d3d] font-['Mulish']">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
