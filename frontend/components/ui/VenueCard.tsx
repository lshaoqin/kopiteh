import { MapPin, ChevronRight } from "lucide-react";
import { Venue } from "@/../types";

interface VenueCardProps {
  venue: Venue;
  onClick: (id: number) => void;
}

export function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <button
      onClick={() => onClick(venue.venue_id)}
      className="w-full flex items-center p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 transition-all text-left group"
    >
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors">
        <MapPin className="w-6 h-6 text-slate-500" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-slate-700 text-lg">{venue.name}</h3>
        <p className="text-sm text-slate-400 truncate max-w-[200px]">
          {venue.address || "Local Food Court"}
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}