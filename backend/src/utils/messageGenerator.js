const messages = [
  "Merhaba, nasılsın?",
  "Bugün hava çok güzel!",
  "Ne yapıyorsun?",
  "Uzun zamandır görüşemiyoruz.",
  "Kahve içmeye ne dersin?",
  "Yeni projende başarılar!",
  "Film önerebilir misin?",
  "Hafta sonu planların var mı?",
  "Kitap okuyor musun bu aralar?",
  "Spor yapıyor musun?",
  "Yemek yemeye çıkalım mı?",
  "Haberler çok kötü değil mi?",
  "Tatil planların var mı?",
  "İş nasıl gidiyor?",
  "Ailen nasıl?"
];

export const generateRandomMessage = () => {
  return messages[Math.floor(Math.random() * messages.length)];
};