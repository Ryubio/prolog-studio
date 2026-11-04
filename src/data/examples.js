export const EXAMPLES = [
  {
    id: 'aile_agaci',
    title: 'Aile Ağacı & Soybağı',
    category: 'Temel & İlişkisel Mantık',
    description: 'Klasik soybağı ilişkileri: ata (ancestor), büyükanne, kardeş ve cinsiyet kuralları.',
    icon: 'Users',
    filename: 'aile_agaci.pl',
    defaultQuery: 'ancestor(abraham, Kim).',
    queries: [
      'ancestor(abraham, Kim).',
      'grandfather(Dede, joseph).',
      'sibling(jacob, Kardes).',
      'father(Baba, Cocuk).'
    ],
    code: `% ============================================================
% Aile Ağacı & Soybağı (Genealogy & Kinship)
% ============================================================

% Gerçekler: parent(Ebeveyn, Cocuk)
parent(abraham, isaac).
parent(sarah, isaac).
parent(isaac, jacob).
parent(isaac, esau).
parent(rebekah, jacob).
parent(rebekah, esau).
parent(jacob, joseph).
parent(jacob, benjamin).

% Cinsiyetler
male(abraham).
male(isaac).
male(jacob).
male(esau).
male(joseph).
male(benjamin).

female(sarah).
female(rebekah).

% Kurallar
father(F, C) :- parent(F, C), male(F).
mother(M, C) :- parent(M, C), female(M).

grandparent(GP, GC) :- parent(GP, P), parent(P, GC).
grandfather(GF, GC) :- grandparent(GF, GC), male(GF).
grandmother(GM, GC) :- grandparent(GM, GC), female(GM).

sibling(X, Y) :-
    parent(P, X),
    parent(P, Y),
    X \\= Y.

brother(B, X) :- sibling(B, X), male(B).
sister(S, X) :- sibling(S, X), female(S).

% Özyinelemeli Ata Kuralı (Recursive Ancestor)
ancestor(A, D) :- parent(A, D).
ancestor(A, D) :- parent(A, Z), ancestor(Z, D).
`
  },
  {
    id: 'graf_arama',
    title: 'Graf Arama & En Kısa Yol',
    category: 'Graflar & Algoritmalar',
    description: 'Şehirler arası yollar, döngüsüz rota bulma ve setof/3 ile en kısa yol tespiti.',
    icon: 'Network',
    filename: 'graf_arama.pl',
    defaultQuery: 'path(istanbul, antalya, Rota, ToplamKm).',
    queries: [
      'path(istanbul, antalya, Rota, ToplamKm).',
      'shortest_path(istanbul, antalya, EnKisaRota, MinKm).',
      'connected(istanbul, Nereye, Mesafe).'
    ],
    code: `% ============================================================
% Türkiye Şehirler Arası Graf & En Kısa Yol Bulucu
% ============================================================

% İki yönlü yollar ve km mesafeleri: edge(Nereden, Nereye, Km)
edge(istanbul, ankara, 450).
edge(istanbul, bursa, 150).
edge(bursa, izmir, 330).
edge(ankara, konya, 260).
edge(konya, antalya, 300).
edge(izmir, antalya, 460).
edge(ankara, antalya, 480).
edge(istanbul, eskisehir, 300).
edge(eskisehir, ankara, 230).
edge(eskisehir, antalya, 420).

% Bağlantı simetrisi (çift yönlü yol)
connected(A, B, D) :- edge(A, B, D).
connected(A, B, D) :- edge(B, A, D).

% Rota Arama (Döngüleri önlemek için Visited listesi kullanılır)
path(Start, End, Path, TotalKm) :-
    travel(Start, End, [Start], RevPath, TotalKm),
    reverse(RevPath, Path).

travel(Start, End, Visited, [End|Visited], Dist) :-
    connected(Start, End, Dist).

travel(Start, End, Visited, FinalPath, TotalKm) :-
    connected(Start, Mid, D1),
    Mid \\= End,
    \\+ member(Mid, Visited),
    travel(Mid, End, [Mid|Visited], FinalPath, D2),
    TotalKm is D1 + D2.

% Tüm rotaları toplayıp en kısasını seçme (setof sıralı döner)
shortest_path(Start, End, BestPath, MinKm) :-
    setof(Km-P, path(Start, End, P, Km), [MinKm-BestPath|_]).
`
  },
  {
    id: 'vezir_8',
    title: '8 Vezir Problemi (CLP/FD)',
    category: 'Kısıt Mantık Programlama',
    description: 'Satranç tahtasında hiçbir vezirin birbirini tehdit etmediği dizilim (CLP-FD ile anında çözüm).',
    icon: 'Crown',
    filename: 'vezir_8.pl',
    defaultQuery: 'n_queens(8, Cozum).',
    queries: [
      'n_queens(8, Cozum).',
      'n_queens(4, Cozum).',
      'findall(C, n_queens(4, C), Tum4Vezirler).'
    ],
    code: `% ============================================================
% N-Vezir Problemi (Constraint Logic Programming - CLP(FD))
% ============================================================
:- use_module(library(clpfd)).

n_queens(N, Qs) :-
    length(Qs, N),
    Qs ins 1..N,
    safe_queens(Qs),
    labeling([ff], Qs).

safe_queens([]).
safe_queens([Q|Qs]) :-
    safe_queens(Qs, Q, 1),
    safe_queens(Qs).

safe_queens([], _, _).
safe_queens([Q|Qs], Q0, D0) :-
    Q0 #\\= Q,
    abs(Q0 - Q) #\\= D0,
    D1 #= D0 + 1,
    safe_queens(Qs, Q0, D1).
`
  },
  {
    id: 'maymun_muz',
    title: 'Maymun ve Muz Yapay Zeka Planlama',
    category: 'Klasik Yapay Zeka',
    description: 'Durum uzayı araması (State-space planning) ile hedefe ulaştıran eylem dizisini üretme.',
    icon: 'Boxes',
    filename: 'maymun_muz.pl',
    defaultQuery: 'canget(state(atdoor, onfloor, atwindow, hasnot), Plan).',
    queries: [
      'canget(state(atdoor, onfloor, atwindow, hasnot), Plan).'
    ],
    code: `% ============================================================
% Maymun ve Muz Yapay Zeka Planlama Problemi
% Durum: state(MaymunKonum, Zemin/Kutu, KutuKonum, MuzDurumu)
% ============================================================

% Hedef Durum: Maymun muza sahip
canget(state(_, _, _, has), []).

% Eylemler ile Durum Geçişleri
canget(State1, [Action | RestActions]) :-
    move(State1, Action, State2),
    canget(State2, RestActions).

% Eylem 1: Muz Kavrama (Maymun kutunun üstünde ve kutu ortada ise)
move(state(middle, onbox, middle, hasnot),
     grasp,
     state(middle, onbox, middle, has)).

% Eylem 2: Kutunun Üstüne Çıkma
move(state(P, onfloor, P, H),
     climb,
     state(P, onbox, P, H)).

% Eylem 3: Kutuyu İtme
move(state(P1, onfloor, P1, H),
     push(P1, P2),
     state(P2, onfloor, P2, H)).

% Eylem 4: Odada Yürüme
move(state(P1, onfloor, B, H),
     walk(P1, P2),
     state(P2, onfloor, B, H)).
`
  },
  {
    id: 'turkce_dcg',
    title: 'Türkçe Doğal Dil Ayrıştırıcı (DCG)',
    category: 'Doğal Dil İşleme',
    description: 'Belirli Tümcecik Gramerleri (DCG) ile Türkçe cümleleri ayrıştırma ve sözdizim ağacı üretme.',
    icon: 'BookOpen',
    filename: 'turkce_dcg.pl',
    defaultQuery: 'cumle(Agac, [ali, kirmizi, elma, yedi], []).',
    queries: [
      'cumle(Agac, [ali, kirmizi, elma, yedi], []).',
      'cumle(Agac, [ayse, kitap, okudu], []).',
      'cumle(Agac, Kelimeler, []).'
    ],
    code: `% ============================================================
% Türkçe Doğal Dil Grameri (DCG - Definite Clause Grammar)
% ============================================================

% Temel Cümle Yapısı: Özne + Nesne + Yüklem
cumle(cumle(O, N, Y)) --> ozne(O), nesne(N), yuklem(Y).

% Özne: İsim veya Sıfat Tamlaması
ozne(ozne(I)) --> isim(I).
ozne(ozne(S, I)) --> sifat(S), isim(I).

% Nesne: İsim veya Belirtili Nesne
nesne(nesne(I)) --> isim(I).
nesne(nesne(S, I)) --> sifat(S), isim(I).

% Yüklem: Eylem
yuklem(yuklem(F)) --> fiil(F).

% Sözlük (Lexicon)
isim(isim(ali)) --> [ali].
isim(isim(ayse)) --> [ayse].
isim(isim(mehmet)) --> [mehmet].
isim(isim(elma)) --> [elma].
isim(isim(kitap)) --> [kitap].
isim(isim(mektup)) --> [mektup].

sifat(sifat(kirmizi)) --> [kirmizi].
sifat(sifat(guzel)) --> [guzel].
sifat(sifat(buyuk)) --> [buyuk].

fiil(fiil(yedi)) --> [yedi].
fiil(fiil(okudu)) --> [okudu].
fiil(fiil(yazdi)) --> [yazdi].
`
  },
  {
    id: 'sudoku',
    title: 'Sudoku Çözücü (CLP/FD)',
    category: 'Kısıt Mantık Programlama',
    description: '9x9 Sudoku matrisini satır, sütun ve 3x3 blok kısıtları ile anında çözen modern Prolog kodu.',
    icon: 'Grid',
    filename: 'sudoku.pl',
    defaultQuery: 'ornek_sudoku(P), sudoku(P).',
    queries: [
      'ornek_sudoku(P), sudoku(P).'
    ],
    code: `% ============================================================
% 9x9 Sudoku Çözücü (CLP/FD)
% ============================================================
:- use_module(library(clpfd)).

sudoku(Rows) :-
    length(Rows, 9),
    maplist(same_length(Rows), Rows),
    append(Rows, Vs), Vs ins 1..9,
    maplist(all_distinct, Rows),
    transpose(Rows, Columns),
    maplist(all_distinct, Columns),
    Rows = [As,Bs,Cs,Ds,Es,Fs,Gs,Hs,Is],
    blocks(As, Bs, Cs),
    blocks(Ds, Es, Fs),
    blocks(Gs, Hs, Is),
    maplist(label, Rows).

blocks([], [], []).
blocks([N1,N2,N3|Ns1], [N4,N5,N6|Ns2], [N7,N8,N9|Ns3]) :-
    all_distinct([N1,N2,N3,N4,N5,N6,N7,N8,N9]),
    blocks(Ns1, Ns2, Ns3).

% Örnek Bulmaca (_ boş kareleri temsil eder)
ornek_sudoku([
    [1,_,_, 8,_,4, _,_,_],
    [_,2,_, _,_,_, 4,5,6],
    [_,_,3, 2,_,5, _,_,_],

    [_,_,_, 4,_,_, 8,_,5],
    [7,8,9, _,5,_, _,_,_],
    [_,_,_, _,_,6, 2,_,3],

    [8,_,1, _,_,_, 7,_,_],
    [_,_,_, 1,2,3, _,8,_],
    [2,_,5, _,_,_, _,_,9]
]).
`
  },
  {
    id: 'zebra_bilmecesi',
    title: 'Einstein Zebra Bulmacası',
    category: 'Mantıksal Çıkarım',
    description: '5 farklı ev, milliyet, içecek, sigara ve evcil hayvan ipuçlarından su içeni ve zebra sahibini bulma.',
    icon: 'HelpCircle',
    filename: 'zebra_bilmecesi.pl',
    defaultQuery: 'zebra_sahibi(Sahip), su_icen(Icen).',
    queries: [
      'zebra_sahibi(Sahip), su_icen(Icen).',
      'zebra(Evler).'
    ],
    code: `% ============================================================
% Einstein Zebra Mantık Bulmacası
% Ev yapısı: ev(Renk, Milliyet, Icecek, Sigara, EvcilHayvan)
% ============================================================

zebra(Houses) :-
    % 5 Ev var
    length(Houses, 5),
    % 1. İngiliz kırmızı evde yaşıyor
    member(ev(kirmizi, ingiliz, _, _, _), Houses),
    % 2. İspanyolun köpeği var
    member(ev(_, ispanyol, _, _, kopek), Houses),
    % 3. Yeşil evde kahve içilir
    member(ev(yesil, _, kahve, _, _), Houses),
    % 4. Ukraynalı çay içer
    member(ev(_, ukraynali, cay, _, _), Houses),
    % 5. Yeşil ev beyaz evin hemen sağında
    saginda(ev(yesil,_,_,_,_), ev(beyaz,_,_,_,_), Houses),
    % 6. Old Gold sigarası içenin salyangozu var
    member(ev(_, _, _, old_gold, salyangoz), Houses),
    % 7. Sarı evde Kools içilir
    member(ev(sari, _, _, kools, _), Houses),
    % 8. Ortadaki evde süt içilir
    Houses = [_, _, ev(_, _, sut, _, _), _, _],
    % 9. Norveçli birinci evde oturuyor
    Houses = [ev(_, norvecli, _, _, _) | _],
    % 10. Chesterfields içen tilkisi olanın yanında oturuyor
    yaninda(ev(_, _, _, chesterfields, _), ev(_, _, _, _, tilki), Houses),
    % 11. Kools içen atı olanın yanında oturuyor
    yaninda(ev(_, _, _, kools, _), ev(_, _, _, _, at), Houses),
    % 12. Lucky Strike içen portakal suyu içer
    member(ev(_, _, portakal_suyu, lucky_strike, _), Houses),
    % 13. Japon Parlament sigarası içer
    member(ev(_, japon, _, parliament, _), Houses),
    % 14. Norveçli mavi evin yanında oturuyor
    yaninda(ev(_, norvecli, _, _, _), ev(mavi, _, _, _, _), Houses),
    % Her evde su ve zebra var mı?
    member(ev(_, _, su, _, _), Houses),
    member(ev(_, _, _, _, zebra), Houses).

saginda(A, B, [B, A | _]).
saginda(A, B, [_ | Rest]) :- saginda(A, B, Rest).

yaninda(A, B, List) :- saginda(A, B, List).
yaninda(A, B, List) :- saginda(B, A, List).

su_icen(Millet) :-
    zebra(Houses),
    member(ev(_, Millet, su, _, _), Houses).

zebra_sahibi(Millet) :-
    zebra(Houses),
    member(ev(_, Millet, _, _, zebra), Houses).
`
  },
  {
    id: 'uzman_sistem',
    title: 'Hayvan Tanıma Uzman Sistemi',
    category: 'Uzman Sistemler',
    description: 'Kural tabanlı geriye dönük çıkarım (backward chaining) ile özellikleri verilen hayvanı teşhis eder.',
    icon: 'ShieldAlert',
    filename: 'uzman_sistem.pl',
    defaultQuery: 'tani(Hayvan, [memeli, etobur, sari_kahve, koyu_benekli]).',
    queries: [
      'tani(Hayvan, [memeli, etobur, sari_kahve, koyu_benekli]).',
      'tani(Hayvan, [kus, ucamaz, uzun_bacakli, siyah_beyaz]).',
      'tani(Hayvan, [kus, iyi_ucar]).'
    ],
    code: `% ============================================================
% Kural Tabanlı Hayvan Teşhis Uzmanı
% ============================================================

% Teşhis kuralları
tani(cita, Ozellikler) :-
    hepsi_var([memeli, etobur, sari_kahve, koyu_benekli], Ozellikler).

tani(kaplan, Ozellikler) :-
    hepsi_var([memeli, etobur, sari_kahve, siyah_cizgili], Ozellikler).

tani(zurafa, Ozellikler) :-
    hepsi_var([toynakli, uzun_boyunlu, uzun_bacakli, koyu_benekli], Ozellikler).

tani(zebra, Ozellikler) :-
    hepsi_var([toynakli, siyah_cizgili], Ozellikler).

tani(devekusu, Ozellikler) :-
    hepsi_var([kus, ucamaz, uzun_boyunlu, uzun_bacakli], Ozellikler).

tani(penguen, Ozellikler) :-
    hepsi_var([kus, ucamaz, yuzer, siyah_beyaz], Ozellikler).

tani(albatros, Ozellikler) :-
    hepsi_var([kus, iyi_ucar], Ozellikler).

% Kural Yardımcısı: Listedeki tüm özelliklerin kullanıcı girdisinde bulunması
hepsi_var([], _).
hepsi_var([H|T], Liste) :-
    member(H, Liste),
    hepsi_var(T, Liste).
`
  }
];
