% ============================================================
% PrologStudio - Modern Mantık Programlama Çalışma Alanı
% ============================================================

% Gerçekler (Facts)
parent(abraham, isaac).
parent(sarah, isaac).
parent(isaac, jacob).
parent(isaac, esau).
parent(rebekah, jacob).
parent(rebekah, esau).
parent(jacob, joseph).
parent(jacob, benjamin).

male(abraham).
male(isaac).
male(jacob).
male(esau).
male(joseph).
male(benjamin).

female(sarah).
female(rebekah).

% Kurallar (Rules)
father(F, C) :- parent(F, C), male(F).
mother(M, C) :- parent(M, C), female(M).

grandparent(GP, GC) :- parent(GP, P), parent(P, GC).
grandfather(GF, GC) :- grandparent(GF, GC), male(GF).
grandmother(GM, GC) :- grandparent(GM, GC), female(GM).

sibling(X, Y) :-
    parent(P, X),
    parent(P, Y),
    X \= Y.

% Özyinelemeli Ata Kuralı (Recursive Ancestor)
ancestor(A, D) :- parent(A, D).
ancestor(A, D) :- parent(A, Z), ancestor(Z, D).
