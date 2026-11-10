import { useState, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialPic: string;
  onSave: (name: string, pic: string) => void;
}

export function ProfileDialog(props: ProfileDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* Only mounted while open → draft state starts fresh each time */}
      {props.open && <ProfileDialogInner {...props} />}
    </Dialog>
  );
}

function ProfileDialogInner({ onOpenChange, initialName, initialPic, onSave }: ProfileDialogProps) {
  const [tempName, setTempName] = useState(initialName);
  const [tempPic, setTempPic] = useState(initialPic);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempPic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        {/* Avatar Preview & Upload */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border shadow-sm">
            <img src={tempPic} alt="Temp Avatar Preview" className="h-full w-full object-cover" />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-all">
              <Camera className="h-6 w-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click image to upload photo</span>
        </div>

        {/* Name Input */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-600">
            Profile Name
          </Label>
          <Input
            id="name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!tempName.trim()} onClick={() => onSave(tempName.trim(), tempPic)}>
            Save Profile
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}