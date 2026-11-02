import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio } from "lucide-react";
import { cities } from "@/data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 동네 통신원 신청 다이얼로그 */
export default function CorrespondentDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [intro, setIntro] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city || !intro.trim()) {
      setError("닉네임, 도시, 한마디는 필수 항목입니다.");
      return;
    }
    setError("");
    setDone(true);
  };

  const reset = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setTimeout(() => {
        setDone(false);
        setName("");
        setCity("");
        setNeighborhood("");
        setIntro("");
        setError("");
      }, 250);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Radio className="h-12 w-12 text-forest" strokeWidth={1.5} />
            <DialogTitle className="serif-display mt-4 text-2xl">통신원 신청이 접수됐습니다</DialogTitle>
            <DialogDescription className="mt-2 leading-6 text-muted-foreground">
              첫 소식은 사진 한 장과 세 문장이면 충분합니다.
              <br />
              확인 후 48시간 안에 연락드릴게요.
            </DialogDescription>
            <button
              onClick={() => reset(false)}
              className="mt-6 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-85"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="serif-display text-2xl">동네 통신원 신청</DialogTitle>
              <DialogDescription className="leading-6">
                특별한 기사가 아니라, 당신의 창밖을 보내주세요.
                사진 한 장, 10초 영상, 세 문장이면 충분합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="corr-name">닉네임 *</Label>
                  <Input
                    id="corr-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예) 통신원 모과"
                    className="bg-paper"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>도시 *</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="bg-paper">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.ko} · {c.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="corr-hood">세부 동네 (선택)</Label>
                <Input
                  id="corr-hood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="예) 뉴몰든, 노스욕, 푸미흥"
                  className="bg-paper"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="corr-intro">당신의 동네 한마디 *</Label>
                <Textarea
                  id="corr-intro"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="예) 매일 아침 페리를 타고 출근합니다. 이 풍경을 한인들과 나누고 싶어요."
                  className="bg-paper"
                  rows={3}
                />
              </div>
              {error && <p className="text-sm font-medium text-coral-deep">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                통신원 신청하기
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
