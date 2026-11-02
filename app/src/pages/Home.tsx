import { useNavigate } from "react-router";
import Hero from "@/sections/Hero";
import Ticker from "@/sections/Ticker";
import Stories from "@/sections/Stories";
import Directory from "@/sections/Directory";
import Trades from "@/sections/Trades";
import Today from "@/sections/Today";
import Community from "@/sections/Community";
import Cheer from "@/sections/Cheer";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    navigate(`/directory${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <>
      <Hero onSearch={handleSearch} />
      <Ticker />
      <Stories />
      <Directory />
      <Trades />
      <Today />
      <Community />
      <Cheer />
    </>
  );
}
