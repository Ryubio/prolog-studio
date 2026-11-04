export const CHEAT_SHEET = [
  {
    category: 'Temel Sözdizimi',
    items: [
      {
        title: 'Gerçekler (Facts)',
        code: 'parent(abraham, isaac).\nmale(abraham).',
        description: 'Her zaman küçük harfle başlar ve nokta (.) ile biter. Doğruluğu kabul edilen ilişkileri ve nesneleri tanımlar.'
      },
      {
        title: 'Kurallar (Rules)',
        code: 'father(F, C) :-\n    parent(F, C),\n    male(F).',
        description: '":-" sembolü "ise / koşuluyla" (IF) anlamına gelir. Virgül (,) VE mantıksal bağlacıdır.'
      },
      {
        title: 'Değişkenler (Variables)',
        code: 'X, Parent, Result, _Anonim',
        description: 'Büyük harfle veya alt tire (_) ile başlar. Tek başına "_" değişkeni "önemsiz / herhangi bir değer" (anonymous variable) anlamına gelir.'
      },
      {
        title: 'Atomlar (Atoms)',
        code: 'elma, istanbul, \'Boşluklu Atom\', x_12',
        description: 'Küçük harfle başlayan sabitler veya tek tırnak içine alınmış metinlerdir.'
      }
    ]
  },
  {
    category: 'Mantıksal Operatörler & Kontrol',
    items: [
      {
        title: 'Unification (Eşleme / Bağlama)',
        code: 'X = 5, foo(A, b) = foo(1, B).',
        description: '= operatörü iki terimi unificate eder (birbirine eşitler ve değişkenleri bağlar).'
      },
      {
        title: 'Eşit Değildir (Non-unifiable)',
        code: 'X \\= Y.',
        description: 'X ile Y terimlerinin birbirine bağlanamayacağını (eşlenemeyeceğini) doğrular.'
      },
      {
        title: 'Kesme Operatörü (Cut: !)',
        code: 'max(X, Y, X) :- X >= Y, !.\nmax(_, Y, Y).',
        description: 'Geri izlemeyi (backtracking) budar. Arama uzayını daraltmak ve verimi artırmak için kullanılır.'
      },
      {
        title: 'Negation as Failure (\\+)',
        code: '\\+ member(X, Visited).',
        description: 'Koşulun kanıtlanamadığı (başarısız olduğu) durumda DOĞRU döner. "Kapalı Dünya Varsayımı"na dayanır.'
      },
      {
        title: 'VEYA Operatörü (;)',
        code: 'parent(P, C) :- father(P, C) ; mother(P, C).',
        description: 'Noktalı virgül (;) mantıksal VEYA (disjunction) anlamına gelir.'
      },
      {
        title: 'IF - THEN - ELSE (-> ;)',
        code: '( X > 0 -> writeln(pozitif) ; writeln(negatif) ).',
        description: 'Koşullu dallanma ifadesi. Soldaki doğruysa -> sonrası, değilse ; sonrası çalışır.'
      }
    ]
  },
  {
    category: 'Aritmetik & Sayılar',
    items: [
      {
        title: 'Değer Atama / Hesaplama (is)',
        code: 'X is 5 + 3 * 2, Toplam is N1 + N2.',
        description: 'Sağ taraftaki aritmetik ifadeyi hesaplar ve sol taraftaki değişkene bağlar.'
      },
      {
        title: 'Sayısal Karşılaştırma',
        code: 'X =:= Y  % Eşit\nX =\\= Y  % Eşit değil\nX < Y, X > Y, X =< Y, X >= Y',
        description: 'Her iki tarafın aritmetik değerlerini hesaplayıp sayısal olarak kıyaslar (Dikkat: küçük-eşit =< şeklindedir).'
      },
      {
        title: 'Aralık & Döngü (between/3)',
        code: 'between(1, 10, X).',
        description: '1 ile 10 arasındaki tam sayıları sırayla üretir.'
      }
    ]
  },
  {
    category: 'Listeler (Lists)',
    items: [
      {
        title: 'Baş ve Kuyruk (Head | Tail)',
        code: '[H|T] = [1, 2, 3].  % H = 1, T = [2, 3]',
        description: 'Listeyi ilk eleman (Head) ve kalan liste (Tail) olarak ayırır.'
      },
      {
        title: 'Eleman Kontrolü & Arama (member/2)',
        code: 'member(X, [elma, armut, muz]).',
        description: 'Listedeki tüm elemanları tek tek X değişkenine bağlar veya elemanın varlığını sınar.'
      },
      {
        title: 'Liste Birleştirme (append/3)',
        code: 'append([1, 2], [3, 4], Sonuc).\nappend(A, B, [1, 2, 3]).',
        description: 'İki listeyi birleştirir veya bir listenin tüm olası iki parçaya bölünüşlerini bulur.'
      },
      {
        title: 'Uzunluk & Tersine Çevirme',
        code: 'length([a, b, c], Len), reverse([1, 2, 3], Rev).',
        description: 'Listenin eleman sayısını bulur veya listeyi tersine çevirir.'
      }
    ]
  },
  {
    category: 'Girdi / Çıktı & Meta-Yüklemler',
    items: [
      {
        title: 'Konsola Yazdırma',
        code: 'write(\'Merhaba\'), nl, writeln(\'Dünya\'), format(\'Değer: ~w~n\', [X]).',
        description: 'Standart çıktıya metin ve terimleri yazdırır. nl yeni satır açar.'
      },
      {
        title: 'Tüm Çözümleri Toplama (findall/3)',
        code: 'findall(X, ancestor(abraham, X), TumTorunlar).',
        description: 'Sorgunun ürettiği tüm çözümleri tek bir Prolog listesinde toplar.'
      },
      {
        title: 'Küme Oluşturma (setof/3 & bagof/3)',
        code: 'setof(X, parent(P, X), BenzersizCocuklar).',
        description: 'Tüm çözümleri toplar, tekilleştirir (tekrarları siler) ve sıralı liste halinde döner.'
      },
      {
        title: 'Dinamik Veritabanı (assertz & retract)',
        code: 'assertz(puan(ali, 100)), retract(puan(ali, 100)).',
        description: 'Çalışma zamanında belleğe yeni gerçekler ekler veya siler.'
      }
    ]
  }
];
