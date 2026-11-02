import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { cities, bizCategories } from "@/data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city || !category) {
      setError("업체명, 도시, 카테고리는 필수 항목입니다.");
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
        setCategory("");
        setDesc("");
        setError("");
      }, 250);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-forest" strokeWidth={1.5} />
            <DialogTitle className="serif-display mt-4 text-2xl">등록 신청이 접수됐습니다</DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              인증 심사 후 48시간 안에 연락드릴게요.
              <br />
              한울과 함께해 주셔서 고맙습니다.
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
              <DialogTitle className="serif-display text-2xl">업체 등록</DialogTitle>
              <DialogDescription>전 세계 한인에게 당신의 가게를 소개하세요. 기본 등록은 무료입니다.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">업체명 *</Label>
                <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 온지음" className="bg-paper" />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-1.5">
                  <Label>카테고리 *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-paper">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {bizCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-desc">한 줄 소개</Label>
                <Textarea id="biz-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="어떤 가게인지 알려주세요" className="bg-paper" rows={3} />
              </div>
              {error && <p className="text-sm font-medium text-coral-deep">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                무료로 등록 신청하기
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
