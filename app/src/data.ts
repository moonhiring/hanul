export type Lang = "ko" | "en";

export const cities = [
  { id: "nyc", ko: "뉴욕", en: "New York", country: "미국" },
  { id: "la", ko: "로스앤젤레스", en: "Los Angeles", country: "미국" },
  { id: "toronto", ko: "토론토", en: "Toronto", country: "캐나다" },
  { id: "vancouver", ko: "밴쿠버", en: "Vancouver", country: "캐나다" },
  { id: "sydney", ko: "시드니", en: "Sydney", country: "호주" },
  { id: "melbourne", ko: "멜버른", en: "Melbourne", country: "호주" },
  { id: "london", ko: "런던", en: "London", country: "영국" },
  { id: "berlin", ko: "베를린", en: "Berlin", country: "독일" },
  { id: "tokyo", ko: "도쿄", en: "Tokyo", country: "일본" },
  { id: "hcmc", ko: "호치민", en: "Ho Chi Minh", country: "베트남" },
];

export const i18n = {
  nav: {
    stories: { ko: "이야기", en: "Stories" },
    directory: { ko: "업소록", en: "Directory" },
    life: { ko: "일자리·모임", en: "Jobs & Meetups" },
    community: { ko: "커뮤니티", en: "Community" },
    register: { ko: "업체 등록", en: "List a business" },
    login: { ko: "로그인", en: "Sign in" },
    logout: { ko: "로그아웃", en: "Sign out" },
  },
  hero: {
    kicker: { ko: "디아스포라 포털 · 750만 재외동포", en: "Diaspora portal · 7.5M Koreans abroad" },
    title1: { ko: "세상 모든 한인을", en: "One warm square" },
    title2: { ko: "잇는 따뜻한 광장", en: "for every Korean," },
    titleLatin: "Every Korean, everywhere.",
    body: {
      ko: "뉴욕의 첫 가게, 시드니의 새 일자리, 런던의 동네 모임까지. 흩어져 있던 한인의 하루를 한 곳에 모았습니다.",
      en: "From a first shop in New York to a new job in Sydney — the everyday of the Korean diaspora, gathered in one place.",
    },
    searchPlaceholder: { ko: "뉴욕 한식당, 시드니 치과, 런던 변호사…", en: "Try “Korean bakery in Sydney”…" },
    searchBtn: { ko: "검색", en: "Search" },
    statCities: { ko: "개 도시", en: "cities" },
    statBiz: { ko: "인증 업체", en: "verified businesses" },
    statStories: { ko: "이번 달 새 이야기", en: "new stories this month" },
  },
};

export const tickerItems = [
  { city: "뉴욕", text: "한식당 ‘온지음’이 인증 업체로 등록됐습니다" },
  { city: "시드니", text: "IT 개발자 구인 공고가 올라왔습니다" },
  { city: "런던", text: "주말 한인 축구 모임, 새 멤버 4명 모집 중" },
  { city: "토론토", text: "김치 담그기 클래스 이번 주 토요일" },
  { city: "멜버른", text: "한인 치과 ‘미소’ 첫 방문 20% 할인" },
  { city: "호치민", text: "한인 부동산 매물 12건 업데이트" },
  { city: "베를린", text: "유학생 멘토링 매칭 3쌍 성사" },
  { city: "도쿄", text: "재일동포 3세 작가 인터뷰 공개" },
];

/* ---------------- 스토리 ---------------- */

export interface Story {
  id: number;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  authorRole: string;
  city: string;
  date: string;
  readTime: string;
  cheers: number;
}

export const stories: Story[] = [
  {
    id: 1,
    tag: "이번 주의 이야기",
    title: "맨해튼 한복판에서 문을 연 68세 초보 사장님의 김밥집",
    excerpt:
      "은퇴 후 이민 24년 만에 처음 가게를 열었습니다. “늦었다고 생각했는데, 동네 사람들이 매일 응원하러 와요.”",
    body: "은퇴 후 이민 24년 만에 처음 가게를 열었습니다. 첫 달은 하루 매출이 80달러였지만, 한인 커뮤니티의 입소문과 동네 단골들 덕분에 지금은 점심시간마다 줄이 생깁니다.\n\n“늦었다고 생각했는데, 동네 사람들이 매일 응원하러 와요. 김밥 한 줄에 마음을 담으면 통하더라고요.” 그는 매일 새벽 5시에 단무지를 썰고, 7시에 첫 김밥을 맙니다.\n\n옹기종기 앉은 손님들 사이에서 사장님은 오늘도 가장 바쁜 사람입니다. “다음 달엔 아들이 주말마다 와서 돕기로 했어요. 가게가 식구를 다시 불러 모으네요.”",
    author: "김온유",
    authorRole: "한울 에디터",
    city: "뉴욕",
    date: "2026.10.28",
    readTime: "6분",
    cheers: 1284,
  },
  {
    id: 2,
    tag: "창업",
    title: "시드니에서 한국식 베이커리로 웨이팅 맛집이 된 90년생 자매",
    excerpt: "소금빵과 인절미 크루아상. 낯선 조합이 동네 아침 풍경을 바꿨습니다.",
    body: "소금빵과 인절미 크루아상. 낯선 조합이 동네 아침 풍경을 바꿨습니다. 자매는 매일 새벽 4시에 반죽을 시작합니다.\n\n“현지 손님이 ‘이거 한국 빵이에요?’라고 물을 때가 제일 뿌듯해요.” 언니는 제빵을, 동생은 디자인과 마케팅을 맡았습니다. 역할은 다르지만 목표는 하나입니다.\n\n“내년엔 2호점이 목표예요. 그때도 새벽 4시에 만나요, 우리.”",
    author: "이하늘·이바다",
    authorRole: "달달 베이커리 공동대표",
    city: "시드니",
    date: "2026.10.24",
    readTime: "5분",
    cheers: 862,
  },
  {
    id: 3,
    tag: "정착",
    title: "베를린 유학 8년, 이제는 후배들의 멘토가 된 엔지니어",
    excerpt: "월세 계약서 한 장 못 읽던 시절에서, 40명의 멘티를 둔 지금까지.",
    body: "월세 계약서 한 장 못 읽던 시절에서, 40명의 멘티를 둔 지금까지. 그는 매주 일요일 카페에서 무료 상담을 엽니다.\n\n“저도 누군가의 도움으로 버텼으니까요. 돌려주는 것뿐입니다.” 상담 주제는 비자 연장부터 독일 직장 문화까지 다양합니다.\n\n그의 노트북에는 8년 치 ‘베를린 생존 메모’가 있습니다. “언젠가 책으로 엮을 거예요. 제목은 벌써 정했습니다. 『잘 왔어, 베를린』.”",
    author: "박도현",
    authorRole: "소프트웨어 엔지니어",
    city: "베를린",
    date: "2026.10.19",
    readTime: "7분",
    cheers: 733,
  },
  {
    id: 4,
    tag: "세대 공감",
    title: "한국어를 잊어가는 딸에게, 아빠가 시작한 일요일 글쓰기 교실",
    excerpt: "2세 딸과 아빠가 매주 주고받는 편지가 쌓여 한 권의 책이 되었습니다.",
    body: "2세 딸과 아빠가 매주 주고받는 편지가 쌓여 한 권의 책이 되었습니다. “처음엔 세 문장 쓰는 것도 힘들어했어요. 지금은 딸이 먼저 편지를 건넵니다.”\n\n일요일 아침, 식탁 위에 편지지 두 장. 룰은 단 하나, 한국어로 쓸 것. 3년이 흐르자 편지는 150통이 됐습니다.\n\n“언어는 가르치는 게 아니라 같이 쓰는 거였어요. 딸이 저를 가르친 셈이죠.”",
    author: "정태영",
    authorRole: "회사원·일요 작가",
    city: "토론토",
    date: "2026.10.12",
    readTime: "5분",
    cheers: 1105,
  },
  {
    id: 5,
    tag: "커리어",
    title: "실리콘밸리를 퇴사하고 토론토에서 찾은 나만의 속도",
    excerpt: "연봉은 낮아졌지만, 저녁이 생겼습니다. 그리고 저녁은 사람을 만듭니다.",
    body: "연봉은 낮아졌지만, 저녁이 생겼습니다. 그리고 저녁은 사람을 만듭니다. 10년을 달린 실리콘밸리를 나와 토론토의 작은 핀테크 팀에 합류한 지 1년.\n\n“예전엔 성장이 곧 숫자였어요. 지금은 숫자가 아니라 방향을 봅니다.” 그는 요즘 주말마다 한인 청년들과 커리어 스터디를 엽니다.\n\n“빨리 가는 것보다 오래 가는 법을 배우는 중입니다. 같이 배울 사람, 언제든 환영이에요.”",
    author: "서지훈",
    authorRole: "핀테크 프로덕트 매니저",
    city: "토론토",
    date: "2026.10.05",
    readTime: "6분",
    cheers: 592,
  },
  {
    id: 6,
    tag: "문화",
    title: "런던 한복판의 한국어 낭독회가 3년째 이어지는 이유",
    excerpt: "매달 마지막 금요일, 열두 명이 모여 시를 읽습니다. 영어로, 그리고 한국어로.",
    body: "매달 마지막 금요일, 열두 명이 모여 시를 읽습니다. 영어로, 그리고 한국어로. 시작은 유학생 셋의 작은 모임이었습니다.\n\n“낭독이 끝나면 꼭 누군가 울어요. 그게 이상하지 않은 밤이에요.” 회비는 없고, 가져오는 것은 좋아하는 문장 하나뿐입니다.\n\n“런던에서 가장 느린 금요일 밤이라고 자부합니다.” 다음 모임은 11월 28일, 뉴몰든의 작은 서점에서 열립니다.",
    author: "모과",
    authorRole: "낭독회 ‘금요일의 문장’ 운영",
    city: "런던",
    date: "2026.09.29",
    readTime: "4분",
    cheers: 445,
  },
  {
    id: 7,
    tag: "정착",
    title: "호치민에서 부침개 가게로 월급쟁이 시절을 넘어선 부부",
    excerpt: "퇴직금으로 연 장사 3년 차. “이제 우리 인생의 월급은 우리가 정합니다.”",
    body: "퇴직금으로 연 장사 3년 차. “이제 우리 인생의 월급은 우리가 정합니다.” 부부의 부침개 가게는 호치민 한인 사이에서 ‘비 오는 날의 성지’로 통합니다.\n\n“처음엔 현지 손님이 없어서 걱정했어요. 지금은 오히려 현지 단골이 절반이에요.” 비결은 간단했습니다. 간을 세 번 다시 맞춘 것.\n\n“이민 와서 제일 잘한 일은 포기를 미룬 일입니다. 딱 1년만 더 해보자, 그게 벌써 3년이 됐어요.”",
    author: "오정민·오정희",
    authorRole: "부침개 가게 ‘비온다’ 부부 사장",
    city: "호치민",
    date: "2026.09.18",
    readTime: "5분",
    cheers: 698,
  },
  {
    id: 8,
    tag: "세대 공감",
    title: "할머니의 사투리를 기록하는 도쿄의 재일동포 3세",
    excerpt: "“할머니의 말이 사라지기 전에 남기고 싶었어요.” 녹음 파일은 벌써 200개.",
    body: "“할머니의 말이 사라지기 전에 남기고 싶었어요.” 녹음 파일은 벌써 200개. 재일동포 3세인 그는 매주 할머니 댁에 가서 옛이야기를 녹음합니다.\n\n“처음엔 귀찮아하시더니, 요즘은 제가 늦으면 전화가 먼저 와요.” 녹음은 팟캐스트가 되어 재일동포 청년들 사이에서 조용히 퍼지는 중입니다.\n\n“우리 세대가 기억해야 할 이야기가 생각보다 많아요. 기록은 누군가의 뿌리가 됩니다.”",
    author: "김소라",
    authorRole: "팟캐스트 ‘할머니의 말’ 제작자",
    city: "도쿄",
    date: "2026.09.08",
    readTime: "6분",
    cheers: 934,
  },
];

/* ---------------- 업소록 ---------------- */

export type BizCategory =
  | "맛집" | "뷰티" | "의료" | "법률·회계" | "교육" | "부동산"
  | "마트·식료품" | "종교·기관" | "기타";
export const bizCategories: BizCategory[] = [
  "맛집", "뷰티", "의료", "법률·회계", "교육", "부동산", "마트·식료품", "종교·기관", "기타",
];

export interface Business {
  id: number;
  name: string;
  initial: string;
  category: BizCategory;
  city: string;
  verified: boolean;
  tagline?: string;
  featured?: boolean;
  about?: string;
  address?: string;
  phone?: string;
  hours?: string;
  promo?: string;
  /* 시드 데이터 전용 필드 */
  website?: string;
  locality?: string;
  rawCategory?: string;
  lat?: number | null;
  lng?: number | null;
  source?: "hanul" | "overture";
}

export const businesses: Business[] = [
  {
    id: 1, name: "온지음", initial: "온", category: "맛집", city: "뉴욕", verified: true,
    tagline: "제철 식재료로 차리는 한식 오마카세", featured: true,
    about: "제철 식재료로 매달 바뀌는 코스를 선보이는 한식 오마카세입니다. 셰프가 직접 뉴욕 인근 농장에서 공수한 채소와 한국에서 들여온 장으로 요리합니다. 예약제로 운영되며, 하루 16석만 받습니다.",
    address: "12 W 32nd St, New York, NY", phone: "+1 212-555-0132", hours: "화–토 17:30–22:00 (일·월 휴무)",
    promo: "한울 회원 웰컴 디저트 제공",
  },
  {
    id: 2, name: "미소 치과", initial: "미", category: "의료", city: "멜버른", verified: true,
    tagline: "한국어 상담 가능한 가족 치과", featured: true,
    about: "한국어로 진료 상담부터 보험 청구까지 도와드리는 가족 치과입니다. 아이부터 부모님까지 온 가족이 편하게 다닐 수 있도록 예약 간격을 넉넉히 잡습니다.",
    address: "88 Koornang Rd, Carnegie VIC", phone: "+61 3 9555 0102", hours: "월–금 09:00–18:00, 토 09:00–13:00",
    promo: "첫 방문 검진 20% 할인",
  },
  {
    id: 3, name: "한결 법률사무소", initial: "한", category: "법률·회계", city: "토론토", verified: true,
    tagline: "이민·비자 전문 15년 경력", featured: true,
    about: "이민 비자, 영주권, 시민권 신청을 전문으로 하는 15년 경력의 법률사무소입니다. 첫 상담 30분은 무료이며, 서류 준비부터 인터뷰 동행까지 함께합니다.",
    address: "621 Yonge St, Toronto, ON", phone: "+1 416-555-0176", hours: "월–금 09:00–17:30",
  },
  {
    id: 4, name: "달달 베이커리", initial: "달", category: "맛집", city: "시드니", verified: true,
    tagline: "매일 새벽 굽는 소금빵과 인절미 크루아상",
    about: "매일 새벽 4시에 반죽을 시작하는 한국식 베이커리입니다. 소금빵, 인절미 크루아상, 단팥빵이 대표 메뉴이며 오후 2시 전 품절되는 날이 많습니다.",
    address: "5 The Boulevarde, Strathfield NSW", phone: "+61 2 9555 0441", hours: "매일 07:00–15:00",
    promo: "소금빵 5개 구매 시 1개 무료",
  },
  {
    id: 5, name: "숲 피부관리", initial: "숲", category: "뷰티", city: "로스앤젤레스", verified: false,
    tagline: "K-뷰티 정통 관리, 첫 방문 체험권",
    about: "한국 에스테틱 정통 관리를 그대로 옮긴 피부관리실입니다. 1:1 맞춤 프로그램으로 진행하며, 사용 제품은 모두 한국 직수입입니다.",
    address: "3377 Wilshire Blvd, Los Angeles, CA", phone: "+1 213-555-0129", hours: "화–일 10:00–19:00 (월 휴무)",
  },
  {
    id: 6, name: "가람 한국어학당", initial: "가", category: "교육", city: "런던", verified: true,
    tagline: "2세 교육부터 성인 비즈니스 한국어까지",
    about: "한국어가 약한 2세 아이부터 비즈니스 한국어가 필요한 성인까지, 수준별 소수정예 수업을 제공합니다. 주말 문화 클래스(서예, 사물놀이)도 운영합니다.",
    address: "14 Kingston Rd, New Malden", phone: "+44 20 8555 0163", hours: "화–토 10:00–18:00",
  },
  {
    id: 7, name: "두레 부동산", initial: "두", category: "부동산", city: "밴쿠버", verified: true,
    tagline: "신규 이민자 정착 렌트 전문",
    about: "신규 이민자와 유학생의 첫 집 구하기를 돕는 부동산입니다. 공항 픽업부터 계좌 개설 안내까지 정착 패키지를 함께 제공합니다.",
    address: "4501 North Rd, Burnaby, BC", phone: "+1 604-555-0198", hours: "월–토 09:30–18:00",
  },
  {
    id: 8, name: "모아 회계", initial: "모", category: "법률·회계", city: "호치민", verified: false,
    tagline: "현지 법인 설립·세무 원스톱",
    about: "베트남 현지 법인 설립, 세무 신고, 노무 관리를 한국어로 처리해 드립니다. 진출 초기 기업과 1인 사업자 모두 환영합니다.",
    address: "21 Nguyen Duc Canh, District 7, HCMC", phone: "+84 28 5555 017", hours: "월–금 08:30–17:30",
  },
  {
    id: 9, name: "초록 소아과", initial: "초", category: "의료", city: "도쿄", verified: true,
    tagline: "일본어가 어려운 부모님들의 단골",
    about: "한국어 진료가 가능한 소아과입니다. 예방접종 스케줄을 한국 기준과 비교해 안내해 드려 아이 키우는 부모님들의 단골이 많습니다.",
    address: "2-14-8 Okubo, Shinjuku, Tokyo", phone: "+81 3 5555 0184", hours: "월–토 09:00–17:00 (수 오후 휴진)",
  },
  {
    id: 10, name: "바다 미용실", initial: "바", category: "뷰티", city: "시드니", verified: true,
    tagline: "한국 스타일 시세이도 펌 전문",
    about: "한국 최신 스타일의 커트와 펌을 전문으로 하는 미용실입니다. 시세이도 정품 약제만 사용하며, 스타일 상담은 한국어로 편하게.",
    address: "12 Railway Pde, Eastwood NSW", phone: "+61 2 9555 0872", hours: "화–일 10:00–19:00",
  },
  {
    id: 11, name: "마루 국밥", initial: "마", category: "맛집", city: "베를린", verified: false,
    tagline: "유학생의 위로, 24시간 순댓국",
    about: "24시간 불이 꺼지지 않는 베를린의 국밥집입니다. 시험 기간이면 새벽에도 자리가 없습니다. 순댓국, 설렁탕, 돼지국밥이 대표 메뉴입니다.",
    address: "Turmstraße 77, 10551 Berlin", phone: "+49 30 5555 019", hours: "연중무휴 24시간",
  },
  {
    id: 12, name: "하늘 공인중개", initial: "하", category: "부동산", city: "뉴욕", verified: true,
    tagline: "퀸즈·뉴저지 매매 전문",
    about: "퀸즈와 뉴저지 지역 주택 매매를 전문으로 합니다. 첫 주택 구입자를 위한 모기지 상담부터 클로징까지 한국어로 함께합니다.",
    address: "154-08 Northern Blvd, Flushing, NY", phone: "+1 718-555-0143", hours: "월–토 09:00–18:00",
  },
  {
    id: 13, name: "들판 한의원", initial: "들", category: "의료", city: "뉴욕", verified: true,
    tagline: "20년 경력의 한방 진료",
    about: "20년 경력의 한의사가 진료하는 한의원입니다. 침, 뜸, 한약 처방까지 개인 체질에 맞춰 진행하며, 보험 적용 상담도 가능합니다.",
    address: "39-01 Main St, Flushing, NY", phone: "+1 718-555-0117", hours: "월–토 09:30–18:30",
  },
  {
    id: 14, name: "솔깃 공방", initial: "솔", category: "교육", city: "로스앤젤레스", verified: false,
    tagline: "한국 전통 공예 원데이 클래스",
    about: "나전칠기, 자개, 매듭공예를 배울 수 있는 원데이 클래스 공방입니다. 2세 아이들과 함께하는 부모 클래스가 특히 인기입니다.",
    address: "928 S Western Ave, Los Angeles, CA", phone: "+1 323-555-0158", hours: "수–일 11:00–18:00",
  },
  {
    id: 15, name: "이음 회계법인", initial: "이", category: "법률·회계", city: "시드니", verified: true,
    tagline: "개인·법인 세금 보고 전문",
    about: "호주 개인 세금 보고부터 법인 회계까지 담당하는 회계법인입니다. 워홀러 세금 환급 상담도 무료로 진행합니다.",
    address: "Suite 3, 815 George St, Sydney NSW", phone: "+61 2 9555 0206", hours: "월–금 09:00–17:30",
    promo: "워홀러 첫 세금 보고 무료 상담",
  },
  {
    id: 16, name: "바래다 부동산", initial: "바", category: "부동산", city: "멜버른", verified: true,
    tagline: "학생 쉐어하우스·렌트 전문",
    about: "유학생 쉐어하우스와 단기 렌트를 전문으로 하는 부동산입니다. 입주 전 가구 세팅 대행과 공과금 정산 관리까지 도와드립니다.",
    address: "232 Russell St, Melbourne VIC", phone: "+61 3 9555 0233", hours: "월–토 09:00–18:00",
  },
  {
    id: 17, name: "궁궐 한식당", initial: "궁", category: "맛집", city: "런던", verified: true,
    tagline: "뉴몰든 20년 터줏대감",
    about: "뉴몰든 한인타운에서 20년째 자리를 지키는 한식당입니다. 갈비찜과 된장찌개가 대표 메뉴이며, 단체 모임 예약을 환영합니다.",
    address: "83 High St, New Malden", phone: "+44 20 8555 0291", hours: "매일 11:30–22:00",
  },
  {
    id: 18, name: "무지개 어린이집", initial: "무", category: "교육", city: "토론토", verified: true,
    tagline: "한영 이중언어 몬테소리",
    about: "한국어와 영어를 함께 쓰는 이중언어 몬테소리 어린이집입니다. 오전엔 영어, 오후엔 한국어로 진행하며 김치 담그기 같은 문화 활동이 커리큘럼에 포함됩니다.",
    address: "55 Finch Ave W, Toronto, ON", phone: "+1 416-555-0224", hours: "월–금 07:30–18:00",
  },
];

/* ---------------- 사장님 소식 (공개 표면은 사업주 발신 글만) ---------------- */

export interface OwnerPost {
  id: number;
  businessId: number;
  kind: "소식" | "피드백 응답" | "감사 인사";
  text: string;
  date: string;
}

export const ownerPosts: OwnerPost[] = [
  { id: 1, businessId: 1, kind: "피드백 응답", date: "2026.10.26",
    text: "점심 대기가 길다는 피드백에 11:30 얼리 seating을 새로 열었습니다. 귀한 시간 내주시는 분들께 늘 죄송하고 감사합니다." },
  { id: 2, businessId: 1, kind: "소식", date: "2026.10.20",
    text: "11월 코스부터 가을 송이와 뉴욕산 농장 배추로 담근 김치가 함께 나갑니다." },
  { id: 3, businessId: 2, kind: "감사 인사", date: "2026.10.22",
    text: "첫 방문 할인으로 찾아주신 부모님들, 아이들 진료 사진을 보내주실 때마다 저희가 더 힘이 납니다." },
  { id: 4, businessId: 4, kind: "피드백 응답", date: "2026.10.25",
    text: "“소금빵이 금방 품절된다”는 말씀에 새벽 반죽을 30% 늘렸습니다. 이제 오후 1시까지는 구입하실 수 있어요." },
  { id: 5, businessId: 17, kind: "소식", date: "2026.10.18",
    text: "20주년을 맞아 11월 한 달, 65세 이상 어르신께 된장찌개를 무료로 드립니다. 부모님과 함께 오세요." },
  { id: 6, businessId: 9, kind: "감사 인사", date: "2026.10.15",
    text: "일본어 서류 대신 읽어달라며 오시는 부모님들. 그 자리가 저희가 이 일을 하는 이유입니다." },
];

/* ---------------- 일자리·부동산·모임 ---------------- */

export interface LifePost {
  id: number;
  kind: "구인" | "부동산" | "모임";
  title: string;
  meta: string;
  time: string;
  comments: number;
  cheers: number;
}

export const lifePosts: Record<string, LifePost[]> = {
  nyc: [
    { id: 1, kind: "구인", title: "맨해튼 한식당 주방보조 · 시급 $22", meta: "온지음 · 풀타임", time: "10분 전", comments: 8, cheers: 21 },
    { id: 2, kind: "부동산", title: "플러싱 원베드 렌트 · 즉시 입주", meta: "하늘 공인중개", time: "1시간 전", comments: 5, cheers: 12 },
    { id: 3, kind: "모임", title: "센트럴파크 아침 러닝 크루 (토요일)", meta: "32명 참여 중", time: "3시간 전", comments: 14, cheers: 56 },
    { id: 4, kind: "구인", title: "뉴저지 물류센터 파트타임 관리자", meta: "주 3일 · 경력 무관", time: "5시간 전", comments: 3, cheers: 9 },
    { id: 5, kind: "모임", title: "30대 직장인 주말 등산 모임", meta: "베어마운틴 · 차량 셰어", time: "어제", comments: 11, cheers: 34 },
  ],
  la: [
    { id: 6, kind: "구인", title: "한인타운 카페 바리스타 · 시급 $19+", meta: "주말 근무 가능자", time: "30분 전", comments: 6, cheers: 15 },
    { id: 7, kind: "부동산", title: "한인타운 신축 아파트 1베드", meta: "$2,150 · 주차 포함", time: "2시간 전", comments: 9, cheers: 18 },
    { id: 8, kind: "모임", title: "캘리포니아 와인 + 한식 페어링 모임", meta: "11월 15일 · 정원 12명", time: "어제", comments: 22, cheers: 61 },
  ],
  toronto: [
    { id: 9, kind: "구인", title: "핀테크 프론트엔드 개발자", meta: "하이브리드 · 영주권자 우대", time: "1시간 전", comments: 17, cheers: 48 },
    { id: 10, kind: "부동산", title: "노스욕 콘도 2베드 · 지하철 3분", meta: "월 $2,680", time: "3시간 전", comments: 4, cheers: 10 },
    { id: 11, kind: "모임", title: "김치 담그기 클래스 (토요일)", meta: "재료비 $25 · 초보 환영", time: "5시간 전", comments: 19, cheers: 72 },
  ],
  vancouver: [
    { id: 12, kind: "부동산", title: "버나비 쉐어하우스 여성 1인실", meta: "월 $980 · 빌 포함", time: "40분 전", comments: 3, cheers: 8 },
    { id: 13, kind: "구인", title: "한인 마트 주말 계산원", meta: "코퀴틀람 · 시급 $18.5", time: "2시간 전", comments: 2, cheers: 6 },
    { id: 14, kind: "모임", title: "스탠리파크 사진 산책 모임", meta: "매주 일요일 오후", time: "어제", comments: 8, cheers: 27 },
  ],
  sydney: [
    { id: 15, kind: "구인", title: "IT 개발자 (React) · 비자 스폰서 가능", meta: "시드니 스타트업", time: "방금", comments: 21, cheers: 74 },
    { id: 16, kind: "부동산", title: "스트라스필드 역세권 쉐어하우스", meta: "주 $320 · 빌 포함", time: "40분 전", comments: 6, cheers: 11 },
    { id: 17, kind: "모임", title: "워홀러 정보 교류 밋업 (11월)", meta: "본다이 비치", time: "2시간 전", comments: 18, cheers: 43 },
  ],
  melbourne: [
    { id: 18, kind: "구인", title: "베이커리 주방 스태프 · 새벽 근무", meta: "달달 베이커리", time: "1시간 전", comments: 4, cheers: 13 },
    { id: 19, kind: "부동산", title: "시티 인근 스튜디오 단기 임대", meta: "3개월 · 가구 완비", time: "3시간 전", comments: 7, cheers: 16 },
    { id: 20, kind: "모임", title: "한인 축구 동호회 주말 경기", meta: "초보 환경 · 정원 3명", time: "어제", comments: 12, cheers: 39 },
  ],
  london: [
    { id: 21, kind: "모임", title: "한인 축구팀 '태극FC' 신입 모집", meta: "매주 일요일 오전", time: "20분 전", comments: 9, cheers: 38 },
    { id: 22, kind: "구인", title: "한국어 튜터 · 시급 £25부터", meta: "가람 한국어학당", time: "2시간 전", comments: 4, cheers: 15 },
    { id: 23, kind: "부동산", title: "뉴몰든 한인타운 2베드 플랫", meta: "월 £1,850", time: "어제", comments: 7, cheers: 19 },
  ],
  berlin: [
    { id: 24, kind: "구인", title: "한식당 홀 서빙 · 주 4일", meta: "미테 지구 · 독일어 무관", time: "1시간 전", comments: 5, cheers: 12 },
    { id: 25, kind: "부동산", title: "베딩 지구 WG 방 하나", meta: "월 €620 · 12월 입주", time: "4시간 전", comments: 10, cheers: 21 },
    { id: 26, kind: "모임", title: "일요일 멘토링 카페 (무료 상담)", meta: "비자·취업·주거", time: "어제", comments: 16, cheers: 58 },
  ],
  tokyo: [
    { id: 27, kind: "구인", title: "한국어 가능 소아과 접수 직원", meta: "신오쿠보 · 파트타임", time: "2시간 전", comments: 3, cheers: 9 },
    { id: 28, kind: "부동산", title: "신주쿠 1K 맨션 · 보증인 상담 가능", meta: "월 ¥98,000", time: "5시간 전", comments: 6, cheers: 14 },
    { id: 29, kind: "모임", title: "재일동포 3세 기록 모임", meta: "월 1회 · 나카노", time: "어제", comments: 8, cheers: 31 },
  ],
  hcmc: [
    { id: 30, kind: "구인", title: "한인 마트 매장 관리 매니저", meta: "푸미흥 · 경력 우대", time: "1시간 전", comments: 2, cheers: 8 },
    { id: 31, kind: "부동산", title: "타오디엔 아파트 월세 · 풀옵션", meta: "$900 · 수영장", time: "4시간 전", comments: 11, cheers: 23 },
    { id: 32, kind: "모임", title: "주말 골프 라운딩 멤버 구합니다", meta: "핸디 무관", time: "어제", comments: 6, cheers: 17 },
  ],
};

/* ---------------- 응원 광장 ---------------- */

export interface CheerPost {
  id: number;
  name: string;
  meta: string;
  text: string;
  cheers: number;
  /** AI가 감지한 따뜻한 글 — 더 진하게 노출 */
  warm?: boolean;
}
export const cheerPosts: CheerPost[] = [
  {
    id: 1,
    name: "최은서",
    meta: "런던 · 유학 3년차",
    text: "내년이면 한국어가 약한 2세 아이들을 위한 그림책 도서관을 엽니다. 후원이 아니라 응원 한마디면 충분해요.",
    cheers: 892,
  },
  {
    id: 2,
    name: "강태산",
    meta: "호치민 · 자영업 1년차",
    text: "한인이 아무도 오지 않던 골목에 떡볶이 가게를 열었습니다. 이번 달 처음으로 흑자를 냈어요. 포기하지 않길 잘했습니다.",
    cheers: 1204,
  },
  {
    id: 3,
    name: "유미나",
    meta: "멜버른 · 간호사",
    text: "야간 근무 끝에 쓰는 이민 생활 에세이가 벌써 40편째. 내년엔 책으로 묶어 같은 길을 걷는 분들께 선물하고 싶습니다.",
    cheers: 677,
  },
  {
    id: 4,
    name: "한지우",
    meta: "베를린 · 엔지니어",
    text: "6개월 준비한 독일 정규직 전환 면접이 다음 주입니다. 떨어져도 다시 일어설 테니, 지켜봐 주세요.",
    cheers: 458,
  },
  {
    id: 5,
    name: "오세린",
    meta: "토론토 · 2세 엄마",
    text: "아이에게 한국어 동화를 읽어주는 주말 모임을 시작했습니다. 첫 모임에 세 가족이 왔어요. 작지만 시작입니다.",
    cheers: 736,
  },
  {
    id: 6,
    name: "마루하",
    meta: "도쿄 · 재일동포 3세",
    text: "할머니의 사투리로 된 자장가를 음원으로 남기는 작업을 시작했습니다. 기술도 돈도 부족하지만, 응원은 넉넉히 받겠습니다.",
    cheers: 1053,
  },
];

/* ---------------- 소문난 장인 (한인 기술자·개인사업자) ---------------- */

export type TradeKind =
  | "전기" | "배관" | "냉난방" | "핸디맨·수리"
  | "열쇠·보안" | "페인트·도배" | "바닥·타일" | "이사·청소";

export const tradeKinds: TradeKind[] = [
  "전기", "배관", "냉난방", "핸디맨·수리", "열쇠·보안", "페인트·도배", "바닥·타일", "이사·청소",
];

export interface Tradesperson {
  id: number;
  name: string;            // 개인정보 보호를 위해 성만 공개하는 경우가 많음
  trade: TradeKind;
  city: string;
  years: number;
  licensed: boolean;       // 현지 면허 보유
  insured: boolean;        // 보험 가입
  korean: boolean;         // 한국어 소통 가능
  vouches: number;         // 소개한 이웃 수
  intro: string;
  voucher?: { name: string; text: string }; // 대표 소개 코멘트
}

export const tradespeople: Tradesperson[] = [
  {
    id: 1, name: "김** 기술자", trade: "전기", city: "샌프란시스코", years: 22, licensed: true, insured: true, korean: true, vouches: 17,
    intro: "주택·상가 전기 공사와 패널 교체 전문. 한인회관 공사도 맡았습니다.",
    voucher: { name: "SF 박** 님", text: "한인회관 전기 공사를 맡겼는데 꼼꼼하고 정직하셨어요. 이런 분이 계신 줄 다들 몰랐습니다." },
  },
  {
    id: 2, name: "이** 기술자", trade: "배관", city: "로스앤젤레스", years: 15, licensed: true, insured: true, korean: true, vouches: 23,
    intro: "누수 탐지부터 온수기 교체까지. 당일 긴급 출동 가능합니다.",
    voucher: { name: "LA 최** 님", text: "새벽에 배관이 터졌는데 한국어로 바로 통화되고 당일 와주셨습니다." },
  },
  {
    id: 3, name: "박** 기술자", trade: "냉난방", city: "시드니", years: 12, licensed: true, insured: true, korean: true, vouches: 11,
    intro: "에어컨·히터 설치와 수리. 한국식 시공 꼼꼼함 그대로.",
    voucher: { name: "시드니 정** 님", text: "여름마다 고생했는데 견적도 정직하게 주시고 AS까지 챙겨주십니다." },
  },
  {
    id: 4, name: "최** 핸디맨", trade: "핸디맨·수리", city: "뉴욕", years: 9, licensed: false, insured: true, korean: true, vouches: 31,
    intro: "가구 조립, 못 박기, 작은 수리 무엇이든. 퀸즈·맨해튼 방문.",
    voucher: { name: "뉴욕 김** 님", text: "이사 후 온갖 잡일을 한 번에 해결해 주셨어요. 동네 엄마들 사이에서 이미 유명합니다." },
  },
  {
    id: 5, name: "정** 기술자", trade: "페인트·도배", city: "토론토", years: 18, licensed: true, insured: true, korean: true, vouches: 14,
    intro: "내·외부 페인팅과 벽지 시공. 마감이 깔끔하기로 소문났습니다.",
    voucher: { name: "토론토 한** 님", text: "집 전체 페인트를 맡겼는데 모서리 마감이 정말 다르더라고요." },
  },
  {
    id: 6, name: "강** 기술자", trade: "열쇠·보안", city: "베를린", years: 7, licensed: true, insured: false, korean: true, vouches: 8,
    intro: "자물쇠 교체, 디지털 도어락 설치, 방범 점검.",
    voucher: { name: "베를린 유** 님", text: "열쇠를 잃어버린 일요일 밤에 와주셨습니다. 독일어 못해도 걱정 없어요." },
  },
  {
    id: 7, name: "윤** 기술자", trade: "바닥·타일", city: "밴쿠버", years: 14, licensed: true, insured: true, korean: true, vouches: 12,
    intro: "욕실 타일, 마루 시공 전문. 견적 무료 방문.",
    voucher: { name: "밴쿠버 서** 님", text: "욕실 리모델링을 맡겼는데 한국 시공 품질 그대로였습니다." },
  },
  {
    id: 8, name: "한** 기술자", trade: "전기", city: "런던", years: 11, licensed: true, insured: true, korean: true, vouches: 9,
    intro: "주택 전기 점검과 인증서(EICR) 발급. 뉴몰든 중심 활동.",
    voucher: { name: "런던 오** 님", text: "집 살 때 전기 점검을 부탁드렸는데 꼼꼼한 리포트까지 주셨어요." },
  },
  {
    id: 9, name: "서** 팀", trade: "이사·청소", city: "멜버른", years: 6, licensed: false, insured: true, korean: true, vouches: 19,
    intro: "한인 소형 이사와 입주·퇴거 청소. 보증금 반환 청소 전문.",
    voucher: { name: "멜버른 장** 님", text: "퇴거 청소 덕분에 보증금 전액 돌려받았습니다." },
  },
  {
    id: 10, name: "오** 기술자", trade: "배관", city: "도쿄", years: 20, licensed: true, insured: true, korean: true, vouches: 13,
    intro: "맨션 배관 수리와 누수 대응. 신주쿠·신오쿠보 중심.",
    voucher: { name: "도쿄 권** 님", text: "일본어가 서툴러 걱정했는데 관리회사와의 소통까지 대신해 주셨습니다." },
  },
];

/* ---------------- 오늘의 동네 (동네 통신원 디스패치) ---------------- */

export type DispatchKind = "photo" | "video" | "note";
export type DispatchMood =
  | "coffee" | "park" | "market" | "rain" | "sunset" | "food" | "street" | "book";

export interface Dispatch {
  id: number;
  kind: DispatchKind;
  city: string;
  neighborhood: string;   // 세부 동네
  time: string;           // "오늘 오전 8:12"
  weather: string;        // "맑음 12°"
  correspondent: string;  // 통신원 닉네임
  text: string;
  mood: DispatchMood;     // 플레이스홀더 아이콘
  hue: number;            // 플레이스홀더 그라데이션 색상
  duration?: string;      // 영상 길이 "0:10"
  likes: number;
}

export const dispatches: Dispatch[] = [
  {
    id: 1, kind: "video", city: "뉴욕", neighborhood: "롱아일랜드시티", time: "오늘 오전 8:12", weather: "맑음 12°",
    correspondent: "통신원 모과",
    text: "출근길 페리에서 본 맨해튼. 오늘은 안개가 도시를 반쯤 숨겼어요.",
    mood: "sunset", hue: 18, duration: "0:10", likes: 47,
  },
  {
    id: 2, kind: "photo", city: "런던", neighborhood: "뉴몰든", time: "오늘 오전 9:40", weather: "흐림 9°",
    correspondent: "통신원 달래",
    text: "한인 마트 앞에 김장철 배추가 들어왔습니다. 올해는 작년보다 쌉니다.",
    mood: "market", hue: 145, likes: 32,
  },
  {
    id: 3, kind: "photo", city: "시드니", neighborhood: "본다이", time: "오늘 오전 7:05", weather: "맑음 21°",
    correspondent: "통신원 파도",
    text: "아침 산책길. 바다색이 오늘따라 제주 바다 같았습니다.",
    mood: "park", hue: 200, likes: 58,
  },
  {
    id: 4, kind: "note", city: "베를린", neighborhood: "미테", time: "오늘 오후 1:20", weather: "비 7°",
    correspondent: "통신원 들꽃",
    text: "우리 동네 카페에 한국어 책 교환 선반이 생겼습니다. 첫 기증은 『아몬드』. 다음 주인을 기다립니다.",
    mood: "book", hue: 262, likes: 24,
  },
  {
    id: 5, kind: "video", city: "도쿄", neighborhood: "신오쿠보", time: "오늘 낮 12:31", weather: "맑음 15°",
    correspondent: "통신원 소라",
    text: "점심시간의 신오쿠보. 한국어가 귀에 들어오면 왜인지 어깨가 편안해집니다.",
    mood: "street", hue: 340, duration: "0:09", likes: 41,
  },
  {
    id: 6, kind: "photo", city: "토론토", neighborhood: "노스욕", time: "오늘 오후 4:55", weather: "첫눈 예보 -1°",
    correspondent: "통신원 단풍",
    text: "첫눈 예보에 마트가 북적였습니다. 김치찌개 재료 품절 주의보.",
    mood: "rain", hue: 215, likes: 36,
  },
  {
    id: 7, kind: "photo", city: "호치민", neighborhood: "푸미흥", time: "오늘 오후 6:10", weather: "맑음 29°",
    correspondent: "통신원 메콩",
    text: "한인 마트 앞 분식 트럭. 떡볶이 냄새에 현지 분들도 줄을 섭니다.",
    mood: "food", hue: 24, likes: 52,
  },
  {
    id: 8, kind: "note", city: "멜버른", neighborhood: "카네기", time: "오늘 오후 3:15", weather: "맑음 18°",
    correspondent: "통신원 유칼리",
    text: "동네 도서관이 한글 주간 전시를 열었어요. 아이들 이름을 한글로 써주는 코너가 제일 인기였습니다.",
    mood: "coffee", hue: 40, likes: 29,
  },
];
