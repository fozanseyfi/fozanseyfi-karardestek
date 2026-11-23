"use client";

import { ContactView } from "@/components/common/contact-view";
import { sendContactMessage } from "./actions";

export default function ContactPage() {
  return (
    <ContactView
      config={{
        current: "karardestek",
        subjectTag: "KararDestek",
        footerTag: "satinalma-karar-destek-platformu",
        bio: "Yenilenebilir enerji sektöründe, büyük ölçekli GES projelerinin geliştirme, yatırım ve işletme süreçlerinde çalışıyorum. Bu platformu, EPC tedarik süreçlerinde taşeron, malzeme ve hizmet tekliflerini tek bir yerde, şeffaf ve ölçülebilir kriterlerle karşılaştırabilmek için bireysel olarak geliştirdim; sektördeki meslektaşlarımın da işine yarayacağı inancıyla paylaşıyorum.",
        formNote:
          "Aşağıdaki formu doldurun; mesajınız hesabınıza bağlı olarak doğrudan bana e-posta ile iletilir.",
        subjectPlaceholder:
          "Kısa bir özet — örn. Excel içe aktarmada sütun sorunu",
        onSend: async ({ topic, subject, message }) => {
          await sendContactMessage({ topic, subject, message });
        },
        privacy: (
          <>
            Tüm veriler <strong>RLS</strong> ile korunur, hesaplar arası izole
            edilir. Geliştirici dahil <strong>hiçbir üçüncü taraf</strong>{" "}
            içeriğinizi göremez veya indiremez.
          </>
        ),
        disclaimerTitle: "Karar destek aracı — nihai karar sizindir",
        disclaimer: (
          <>
            Algoritma sonuçları yol gösterici niteliktedir. Nihai satın alma
            kararının sorumluluğu kullanıcıya aittir;{" "}
            <strong>
              teknik, finansal veya hukuki danışmanlık yerine geçmez
            </strong>
            .
          </>
        ),
        legalIntro:
          "Bu uygulama bir satınalma karar destek yardımcısıdır. Sözleşmeler, ihale süreçleri ve resmi tedarikçi seçimi için tek başına bağlayıcı kabul edilemez. Platformu kullanmaya devam ederek aşağıdaki şartları kabul etmiş sayılırsınız.",
        clauses: [
          {
            title: "Bilgi Amaçlı Kullanım",
            body: (
              <>
                Bu platform; GES/RES projelerinde taşeron, malzeme ve hizmet
                tekliflerini çoklu kriterle karşılaştırmak için geliştirilmiş
                bir <strong>karar destek aracıdır</strong>. Üretilen skorlar,
                sıralamalar ve raporlar{" "}
                <strong>
                  resmi bir ihale kararı, tedarikçi onayı veya sözleşme niteliği
                  taşımaz
                </strong>
                ; herhangi bir tarafa karşı bağlayıcı değildir.
              </>
            ),
          },
          {
            title: "Skor Algoritması ve Ağırlıklar",
            body: (
              <>
                Skorlar; kullanıcının girdiği fiyatlara, hedef bütçeye, metrik
                ağırlıklarına ve manuel değerlendirmelere dayanır.{" "}
                <strong>
                  Varsayılan ağırlıklar ve şablonlar örnek referans değerlerdir
                </strong>
                ; her projenin koşullarına göre gözden geçirilmelidir.
              </>
            ),
          },
          {
            title: "Teklif ve Firma Bilgileri",
            body: (
              <>
                Platforma girilen teklif tutarları, firma bilgileri ve
                revizyonların{" "}
                <strong>
                  doğruluğu ve güncelliği tamamen kullanıcının sorumluluğundadır
                </strong>
                . Örnek şablonlardaki firma isimleri hayalidir ve gerçek
                kurumları temsil etmez.
              </>
            ),
          },
          {
            title: "Kullanıcı Sorumluluğu",
            body: (
              <>
                Platform üzerinde oluşturulan karşılaştırmaların, PDF/Excel
                çıktılarının{" "}
                <strong>
                  içeriği, üçüncü taraflarla paylaşılması ve bu çıktılara
                  dayanılarak verilen satın alma kararlarının hukuki sonuçları
                  tamamen kullanıcının sorumluluğundadır
                </strong>
                .
              </>
            ),
          },
          {
            title: "Sorumluluk Sınırlaması",
            body: (
              <>
                Platform sahibi ve geliştiricisi; platformun kullanımından veya
                kullanılamamasından, hesaplama hatalarından, eksik/yanlış veri
                girişinden ve verilen satın alma kararlarının yarattığı doğrudan
                veya dolaylı zararlardan — kâr kaybı, gecikme, sözleşmesel
                cezalar dâhil —{" "}
                <strong>hiçbir şekilde sorumlu tutulamaz</strong>.
              </>
            ),
          },
          {
            title: "Hizmet Sunumu",
            body: (
              <>
                Platform &quot;olduğu gibi&quot; (as-is) sunulur; kesintisiz
                erişim, hatasız çalışma veya belirli bir amaca uygunluk
                konusunda{" "}
                <strong>hiçbir açık veya zımni garanti verilmez</strong>.
                Geliştirici, platformu önceden bildirimde bulunmaksızın
                güncelleme, geçici olarak durdurma veya tamamen kapatma hakkını
                saklı tutar.
              </>
            ),
          },
        ],
      }}
    />
  );
}
