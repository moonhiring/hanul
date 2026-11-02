import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake } from "lucide-react";
import { cities, tradeKinds } from "@/data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 이웃이 대신 기술자를 소개하는 등록 다이얼로그.
 * 기술자 본인이 아니라 "아는 이웃"이 등록한다는 점이 업체 등록과 다릅니다.
 */
export default function IntroduceTradeDialog({ open, onOpenChange }: Props) {
  const [proName, setProName] = useState("");
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState("");
  const [myName, setMyName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proName.trim() || !trade || !city || !reason.trim()) {
      setError("기술자 성함, 분야, 도시, 소개 이유는 필수 항목입니다.");
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
        setProName("");
        setTrade("");
        setCity("");
        setContact("");
        setReason("");
        setMyName("");
        setError("");
      }, 250);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Handshake className="h-12 w-12 text-forest" strokeWidth={1.5} />
            <DialogTitle className="serif-display mt-4 text-2xl">소중한 소개, 고맙습니다</DialogTitle>
            <DialogDescription className="mt-2 leading-6 text-muted-foreground">
              한울이 본인 확인과 연락 동의를 거쳐 공개합니다.
              <br />
              당신의 소문 한 줄이 낯선 땅의 누군가를 돕습니다.
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
              <DialogTitle className="serif-display text-2xl">이런 분, 소개 등록합니다</DialogTitle>
              <DialogDescription className="leading-6">
                스스로 광고하지 않는 기술자일수록 이웃의 소개가 필요합니다.
                본인 동의 없이 연락처가 공개되지 않으니 안심하고 소개해 주세요.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pro-name">기술자 성함 *</Label>
                  <Input
                    id="pro-name"
                    value={proName}
                    onChange={(e) => setProName(e.target.value)}
                    placeholder="예) 김철수 (김** 으로 공개 가능)"
                    className="bg-paper"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pro-contact">연락처 (선택, 비공개)</Label>
                  <Input
                    id="pro-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="확인 절차에만 사용"
                    className="bg-paper"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>기술 분야 *</Label>
                  <Select value={trade} onValueChange={setTrade}>
                    <SelectTrigger className="bg-paper">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradeKinds.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="reason">소개 이유 *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="예) 배관이 터진 새벽에 와주셨어요. 솜씨도 인품도 믿을 수 있는 분입니다."
                  className="bg-paper"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="my-name">소개하는 분 (내 이름 또는 닉네임)</Label>
                <Input
                  id="my-name"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="예) 뉴욕 김**"
                  className="bg-paper"
                />
              </div>
              {error && <p className="text-sm font-medium text-coral-deep">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                소개 등록하기
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
