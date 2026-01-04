---
title: 'Git 이전의 버전 관리 시스템은 어땠을까?'
date: 2025-03-16
tags: ["history"]
category: "article"
excerpt: ""
draft: false
---

## 개요

**형상관리**는 영어 약자로 SCM(Software Configuration Management)이라 하며, 소프트웨어 혹은 소스코드의 변경 사항을 체계적으로 관리하기 위한 개념입니다.

이 형상관리의 하위 개념으로 버전 관리 시스템(VCS, Version Controll System), 소스코드관리(Source Code Management) 등 여러가지 개념이 존재하지만 통상적으로 동일한 개념을 의미합니다.

이번 글에서는 형상 관리라는 단어 대신 '버전 관리'라는 단어로 통일해서 설명할 것입니다.

이 버전 관리의 전반적인 목표는 동일한 문서의 여러 버전을 저장하고 관리하는 것인데요:

<img src="https://github.com/user-attachments/assets/3b9f260e-71ea-458e-b350-7e4145dc9c7c" />

작업을 하다보면 버그가 발생해서 복구를 해야할 때도 있고, 프로젝트의 과거 어떤 시점으로 돌아가야 할 필요가 있습니다.

하지만 위 그림처럼 파일을 관리하면 시간 순서에 따라 구성된 파일 버전의 기록을 제공한다는 점에서 잘 작동할테지만, 파일이 버전마다 어떻게 변경되었는지, 특정 버전을 저장한 이유 또는 다양한 버전이 어떻게 관련되어 있는지에 대한 정보를 제공하지 않습니다.

또한 사용자가 파일 버전의 이름을 지정할 때 실수를 하거나 돌아가서 순서가 아닌 파일을 편집하는 작업이 발생하겠죠.

이런 문제점을 해결 해주는 것이 바로 **버전 관리 시스템(Version Control System, VCS)** 입니다. 개발자들이 사용하는 Git이 바로 버전 관리 시스템의 종류 중 하나입니다.

버전 관리 시스템 덕분에 개발자들이 완전히 다른 위치에서 작업하더라도 프로젝트의 일관되고 최신 기록에 액세스할 수 있도록 보존할 수 있는 것이죠.

이 글에서는 Git 등장 이전에 어떤 불편함 때문에 버전 관리 시스템이 탄생하였고, 어느 부분이 개선되어 왔는지 시간 순으로 나열하면서 'Git은 어떻게 주류가 되었는지'에 대해 설명합니다.

예상 독자는 다음과 같습니다.

- 소프트웨어 개발 역사에 관심이 있으신 분
- 버전 관리 시스템의 발전 과정이 궁금하신 분

## 세대로 살펴보는 버전 관리 시스템

### 버전 관리 시스템의 선구자

<img src="https://github.com/user-attachments/assets/4fff2b8f-2e28-40f4-9995-c1a1d9a3ba0f" />

`IBM`사의 운영체제인 **OS/360(IBM System/360 Operating System)** 의 **IEBUPDTE**는 버전 관리 시스템의 선구자 격이 되는 프로그램입니다.

1960년대의 컴퓨터는 펀치 카드(천공 카드)를 사용해 데이터를 저장했는데요, IEBUPDTE는 DASD(Direct Access Storage Device)로 소스 라이브러리를 배포하는데 사용되었습니다.

예시는 IBM 메인프레임 운영 체제에서 배치 작업을 실행하는 스크립팅 언어인 JCL(Job Control Language)입니다.

```
//UPDATEPGM JOB (ACCT),'PROGRAMMER',MSGLEVEL=(1,1)
//STEP1    EXEC PGM=IEBUPDTE,PARM=MOD
//SYSPRINT DD SYSOUT=A
//SYSUT1   DD DSN=USER.SOURCE.LIB,DISP=OLD
//SYSUT2   DD DSN=USER.SOURCE.LIB,DISP=OLD
//SYSIN    DD *
./ ADD NAME=MYPROG,LIST=ALL,SOURCE=0,LEVEL=01
000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID. MYPROG.
000300 ENVIRONMENT DIVISION.
000400 DATA DIVISION.
000500 PROCEDURE DIVISION.
000600     DISPLAY "HELLO, WORLD!".
000700     STOP RUN.
./ NUMBER NEW1=000800,INCR=100
000800     DISPLAY "VERSION 2 CHANGES".
./ ENDUP
/*
```

>`./ ADD NAME=MYPROG,LIST=ALL,SOURCE=0,LEVEL=01`:

이 라인은 ‘MYPROG’라는 이름의 새 멤버를 추가하거나 기존 멤버를 업데이트하며, `LEVEL=01`은 이 멤버의 버전 번호를 나타냅니다.

>	`000100` ~ `000700`:

이는 프로그램의 원본 코드입니다. 각 라인의 앞 6자리는 시퀀스 번호로, 코드의 순서를 관리합니다.

>	`./ NUMBER NEW1=000800,INCR=100`:

이 라인은 새로운 코드 라인의 시퀀스 번호를 설정합니다. `NEW1=000800`은 새 라인의 시작 번호를, `INCR=100`은 증가 간격을 나타냅니다.

>	`000800     DISPLAY "VERSION 2 CHANGES".`:

이는 새로 추가된 코드 라인으로, 버전 2의 변경사항을 나타냅니다.

>	`./ ENDUP`:

마지막으로 업데이트 작업의 끝을 나타냅니다.

이 시스템에서 확인할 수 있는 것은 다음과 같은데요:

- 멤버 이름과 레벨 번호로 각 버전을 식별
- 시퀀스 번호를 사용하여 코드의 각 라인을 추적
- 새로운 코드를 추가할 때 `./ NUMBER` 명령어로 시퀀스 번호를 관리
- 전체 코드를 다시 작성하지 않고 변경사항만 추가

현대의 버전 관리 시스템에 비교했을 때 제한적이지만, 당시로써는 코드의 변경점을 추적하고 관리하는 효과적인 방법이었습니다.

IEBUPDTE는 현대 버전 관리 시스템의 직접적인 전신은 아니지만, 버전 관리의 개념을 소프트웨어 개발 과정에 도입했다고 알려진 첫 시스템입니다.

### 1세대

<img src="https://github.com/user-attachments/assets/37f74fb6-816b-430c-ad7a-7f9f463434ea" />

1세대의 버전 관리 시스템의 특징은 **로컬 버전 제어 소프트웨어**라는 것 입니다.

개별 파일의 변경 사항을 추적하도록 의도되었으며, 체크아웃된 파일은 한 번에 한 사용자만 로컬에서 편집할 수 있었습니다.

또한 모든 사용자가 자신의 계정으로 동일한 공유 UNIX 호스트에 로그인한다는 가정 하에 구축되었죠.

#### SCCS(Source Code Control System)

<img src="https://github.com/user-attachments/assets/3ece2c56-1a4a-4e15-bcf5-8943ff3eaffa" />

1970년대 초에는 VT100(사진의 컴퓨터)과 같은 비디오 단말기와 UNIX 운영체제 및 DEC(Digital Equipment Corporation)사의 TSS/8과 같이 컴퓨터를 대화식으로 사용하려는 시도에서 탄생한 '시분할 운영 체제'가 저렴해지고 널리 보급되기 시작했습니다.

1972년은 데니스 리치가 만든 C언어가 탄생한 해이기도 한데요, SCCS는 C언어로 작성되었습니다.

<img src="https://github.com/user-attachments/assets/af458469-ad1c-44cd-b4f9-2b9896561095" />

이런 시대적 배경과 필요성에 의해 1972년에 벨 연구소의 마크 로시킨드(Marc J. Rochkind)는 IBM의 운영체제인 OS/370에서 소스 파일 개정 추적 문제를 해결하기 위해 SCCS를 설계했습니다.

여기서 **델타(delta)** 라는 개념이 사용됩니다. 수학에서는 '변화량'을 의미하는 단어지만, 버전 관리 시스템(VCS)에서는 두 버전 간의 (변화로 인한) 차이점을 의미합니다.

파일이나 코드의 특정 시점에서 발생한 변경 사항을 나타내며, 주로 텍스트 파일의 추가, 삭제, 수정 등의 내용을 포함합니다.

예시로 살펴보겠습니다.

```
foo
bar
```

먼저 `sccs create <filename.ext>` 명령어로 SCCS에 새 파일을 체크인하고 해당 파일에 대한 새 히스토리 파일을 만들고 foo와 bar라는 단어를 저장합니다. 이제 다음과 같이 파일을 수정합니다.

```
bar
baz
```

이걸 GIT의 diff로 변경 내역을 확인한다면 다음과 같은 형식일텐데요:

```
--- a/test
+++ b/test
@@ -1,2 +1,2 @@
-foo
 bar
+baz
```

반면 SCCS는 다음과 같은 방법을 사용합니다.

```
^AI 1
^AD 2
foo
^AE 2
bar
^AI 2
baz
^AE 2
^AE 1
```

첫 줄의 `^AI 1`과 `^AD 2`는 "버전 1에서 이 줄이 삽입되었고, 버전 2에서 삭제되었다"는 것이고, 그 다음 줄의 내용은 `foo`라는 것을 나타냅니다.

이러한 방식을 `인터리브 델타(Interleaved Deltas)` 또는 `위브(weave)` 라고 부릅니다.

'weave'의 사전적 의미는 옷감이나 직물같은 것을 '엮다'라는 의미인데요, SCCS는 원본 텍스트 파일 안에 변경된 줄과 그 정보를 함께 엮어서 저장합니다.

이렇게 개발자들은 이전 버전의 원본 소스 코드와 저장된 변경 사항을 검색할 수 있게 되었는데 여기서 몇 가지 한계점이 있습니다.

##### 로컬 전용 시스템(local-only)

먼저 사용자 간에 변경 사항(위에서 설명한 델타)를 교환하는 방법을 제공하지 않았습니다.

당시에는 시분할 컴퓨터 시대였기 때문에 이런 기능이 필요하지 않았습니다. 그래서 중앙 컴퓨터에 계정을 가지고 독립적으로 작업하거나 동료들과 작업 폴더를 공유하는 방식을 작업했습니다.

##### 단일 파일 추적(single-file only)

또한 시스템 상의 한계로 '한 번에 하나의 파일'만 변경 사항을 추적할 수 있었습니다.

요즘처럼 여러 파일을 포함하는 '저장소'의 개념이나 여러 파일에 걸친 '원자적 커밋(atomic commits)'이라는 개념은 아직 존재하지 않았습니다.

##### 잠금 메커니즘(locking)

SCCS는 단일 작성자의 접근을 보장하기 위해 **잠금 방식**을 사용했습니다.

SCCS 시스템 제어 하의 파일은 사용자가 편집을 위해 가져오기 전까지는 디스크에서 읽기 전용(read-only)이였습니다.

여기서 다른 사용자가 파일을 체크아웃(해당 파일을 가져옴과 동시에 변경 권한을 갖게되는 것)한 상태라면 SCCS는 작업을 중단했죠.

오늘날 SCCS를 사용하는 사람은 거의 없지만 `델타 저장`, `커밋에 대한 주석 추가 및 체크아웃 중 버전 ID 확장`과 같은 아이디어는 여러 버전 관리 시스템에서 이어졌습니다.

#### RCS(Revision Control System)

<img src="https://github.com/user-attachments/assets/77c6f956-33bc-4c03-8f47-e10c742d3288" />

SCCS가 만들어진 이후 첫 9년 동안은 유일한 버전 관리 시스템이었지만, 1982년 퍼듀 대학의 월터 티치(Walter F. Tichy)가 당시 오픈 소스가 아니었던 SCCS에 대한 대안으로 RCS를 개발했습니다.

SCCS와 비교해서 RCS의 가장 큰 변화는 역 델타(Reversed, Separated Deltas)를 채택한 것입니다.

역 델타 방식의 의의는 **변경 내역을 순차적으로 추적하는 것**입니다.

먼저 파일이 체크인(버전관리 시스템에 해당 파일을 반영함과 동시에 변경권한을 잃는 것)되면 파일 내용의 전체 스냅샷이 히스토리 파일에 저장됩니다. 파일이 수정되어 다시 체크인되면 기존 히스토리 파일 내용을 기반으로 델타가 계산됩니다.

여기서 이전 스냅샷은 삭제되고 새 스냅샷과 델타가 저장되어 이전 상태로 돌아갑니다. 이는 역 델타 이전의 리비전(수정 사항)을 체크아웃하기 위해 RCS가 파일의 최신 버전에서 시작하여 이전 리비전에 도달할 때까지 연속 델타를 적용하기 때문에 호출되는 것입니다.

이 방법을 사용하면 현재 리비전의 전체 스냅샷을 항상 사용할 수 있으므로 현재 리비전을 매우 빠르게 체크아웃할 수 있게되죠.

그러나 체크아웃 리비전이 오래될수록 현재 스냅샷에 대해 계산해야 하는 델타 수가 늘어나기 때문에 체크아웃에 걸리는 시간이 길어지게 되는 맹점이 있습니다.

SCCS와 비교하여 RCS는 과거 버전은 델타(diff)만 저장하므로, **파일 크기가 작아지고 저장 공간이 절약**할 수 있고, 역 델타 방식을 사용하기 때문에 **최신 버전 파일의 조회 속도가 훨씬 빨라졌습니다.**

하지만 사용자가 버전 기록을 편집할 수 있다는 점에서 보안성이 거의 없으며, 여전히 한 번에 한 명의 사용자만 작업할 수 있었습니다.

### 2세대

<img src="https://github.com/user-attachments/assets/5f0dfa63-fb48-4d32-b8de-96dc647e58a9" />

2세대 버전 관리 시스템의 특징은 **중앙 집중형 버전 제어 도구** 라는 것입니다.

저장소가 로컬에 있지 않고 원격에 존재하기 때문에 여러 사람이 원격 서버에 소스를 저장하거나 사용할 수 있게 된 것이죠.

모든 소스들이 하나의 서버에서 통합되기 때문에 버전 관리 업무도 쉽게 처리할 수 있으며, 개발자 간 소스 파일 공유도 편리해졌습니다.

#### CVS(Concurrent Versions System)

<img src="https://github.com/user-attachments/assets/dd7892c5-49c1-48d7-be63-ae76c76d9fb1" />

1986년에 딕 그뤼너(Dick Grune)가 RCS를 기반으로 한 CVS(Concurrent Versions Systems)를 개발했습니다.

CVS가 가지는 의의는 버전 관리 시스템 역사상 처음으로 **여러 개발자가 동시에 같은 파일을 체크아웃하고 작업할 수 있도록 허용**했다는 것입니다.

뿐만 아니라 파일 단위의 버전 관리를 제공하는 RCS와 달리 **프로젝트 단위의 버전 관리**를 제공했죠.

CVS의 등장으로 두 명 이상의 개발자가 파일 작업을 수행할 수 있게 되었고 사용자는 `updateversion` 명령으로 서버의 해당 파일의 최신 버전으로 파일을 업데이트할 수 있게 되었습니다.

또한 파일 잠금(locking) 개념을 가지고 있던 RCS와는 달리 CVS는 충돌을 해결하기 위해 병합(merge) 모델을 기본적으로 사용했으며, 브랜치 및 심볼릭 태그를 도입 한 최초의 버전 관리 시스템입니다.

이렇게 **다중 사용자 환경을 제공**하고 **프로젝트 단위**의 버전 관리를 제공하는 CVS에도 여전히 한계가 있습니다.

불안정한 동시성 제어와 원격 저장소의 느린 속도와 같은 문제가 있어 추후 설명할 SVN으로 대체됩니다.

#### SVN(Subversion)

<img src="https://github.com/user-attachments/assets/bf17baec-6968-480c-95db-4b7373a16b0a" />

SVN은 CVS의 한계를 극복하고자 2000년에 Collabnet Inc 사에서 만들어졌으며(현재는 Apache 재단에서 관리), CVS에 포함된 많은 기능을 보존하면서 사용자가 두 버전 관리 시스템 사이를 전환할 수 있도록 했습니다.

로컬 전용, 파일 잠금 등 많은 문제를 개선해왔지만 여전히 원자적인 커밋은 지원하는 시스템은 없었습니다.

드디어 SVN에서 문제가 발생할 경우 커밋이 완전히 성공하거나 완전히 중단되도록 보장하는 원자적 커밋 기능이 도입되었습니다.

클라이언트에서 커밋이 발생하면, 사용자가 변경된 파일이나 추가 혹은 삭제된 파일이 서버 레포지토리에 반영됩니다.

이때 커밋 시 원자성 트랜잭션을 가지는데 말그대로 체인징셋(changing-set, 위에서 변경된 파일들) 전체가 커밋되거나 하나라도 실패시 롤백이 됩니다.

이렇게 많은 문제점을 개선해왔지만 중앙 집정식 버전 관리는 저장소가 로컬에 있지 않고 원격에 존재하기 때문에 여러 사람이 원격 서버에 소스를 저장하거나 사용할 수 있지만 치명적인 단점이 있습니다.

먼저 서버에 문제 발생 시 복구 전까지 버전 관리 시스템을 사용할 수 없는 것이고, 서버에 모든 소스가 저장되어 있기 때문에 서버의 데이터가 손실될 경우 100% 복구하기 어려울 수도 있다는 점입니다.

위에서 제기한 문제점을 하나씩 제거하면서 개선되어 왔음에도 불구하고 여전히 **중앙 서버가 존재해야 한다는 한계**가 존재했습니다.

### 3세대

<img src="https://github.com/user-attachments/assets/34df9b63-7a72-4907-bd4b-4cc874428ad0" />

3세대를 나누는 특징은 **분산 버전 제어 시스템(DCVS, Distributed Version Controll System)** 입니다.

위에서 살펴본 중앙 집중형 버전 관리가 가진 단점의 원인은 각 **클라이언트가 원격 서버의 모든 정보를 가지고 있지 않고** 가장 **최신 버전의 스냅샷만을 가지고 있었기 때문**입니다.

분산 버전 제어 시스템은 서버에서 소스코드를 clone할 때 최신 버전의 코드만 가져오지 않고, 원격 서버의 저장소에 기록되어 있는 모든 정보를 가져오는 방식으로 중앙 집중형 버전 관리의 문제점을 해결했습니다.

이렇게 되면 서버의 데이터도 로컬에 존재하기 때문에 불필요한 서버 접근을 최소화하여 속도도 빠를 뿐더러, 소스 코드를 서버에 pull 혹은 push 할 때를 제외하고는 네트워크에 접속한 상태가 아니더라도 대부분의 작업을 로컬에서 수행하고 최종 작업 결과만 서버에 push하면 됩니다. (현재 사용하는 GIT 처럼 말이죠!)

#### Git

<img src="https://github.com/user-attachments/assets/6f62b6b9-ea9b-4bc4-9a59-af16cffdf76e" />

`리누스 토발즈`가 만든 **Git**은 버전 관리 시스템의 메인 스트림이 되었습니다.

<img src="https://github.com/user-attachments/assets/edfc5be5-f993-45a2-8189-ed4f67ef33be" />

Git은 분산형 버전 관리 시스템(DVCS, Distributed Version Controll System)으로 중앙에 위치한 `원격 저장소`와 `로컬 저장소` 두 영역에서 모든 버전 관리 작업을 수행할 수 있어 SVN과 달리 네트워크 연결 없이도 모든 관리 작업을 수행할 수 있게 되었습니다.

또한 히스토리 관리에 있어서도 SVN은 한번 커밋을 하게되면 이를 수정하기가 매우 어려운 반면, Git은 상황에 따라 다르지만 커밋을 되돌리거나 하는 방법으로 자유롭게 수정, 변경할 수 있습니다.

Git은 위에서 언급했던 로컬 환경 문제, 원자성 보장, 잠금 메커니즘, 병합 문제를 문제점을 해결하고 더불어 속도와 무결성 검사 등등 여러 요소를 개선하면서 현대 소프트웨어의 개발 표준으로 자리잡게 되었습니다.

## 맺음

달에 하나 origin series를 작성하기로 했는데 이번 달에도 성공적으로 마쳤네요.

역사를 좋아하다보니 이렇게 타임 라인을 따라 거슬러 올라가면 기술의 흥미도가 더 올라가는 것 같습니다. 과거의 개발자들은 어떻게 저런 생각을 했을지 경외감도 들기도 하고..

현재 Git은 버전 관리 시스템의 왕으로 군림하고 있지만 갑자기 새로운 패러다임을 가진 시스템이 나올 수 있지 않을까요? (물론 그러기엔 Github의 존재가 너무 크기는 한데..)

개인적으로 Git은 학습 곡선이 굉장히 높기 때문에 좀 더 유저 친화적인 기술이 있으면 어떨까 생각을 항상 하긴 합니다..

그렇게 되려면 Git을 대체할 핵심 개념이 필요할 것 같은데 그게 무엇인지는 모르겠지만, 세계 어느 미지의 연구실에서 갑자기 Git을 뒤집을 만한 시스템을 완성하고 있다면..? (망상)

읽어주셔서 감사하고 피드백이나 잘못된 내용이 있다면 달게 받겠습니다.

## 출처

- [What is Version Control?](https://ucdavisdatalab.github.io/workshop_introduction_to_version_control/version-control.html)
- [Version Control Systems | A Technical Guide to VCS Internals](https://initialcommit.com/blog/Technical-Guide-VCS-Internals)
- [OS Utilities](https://www.jaymoseley.com/hercules/downloads/pdf/osutil.pdf)
- [버전 관리 시스템](https://m.blog.naver.com/dlwlalsggg/50184150678)
- [SVN Revision에 대해서](https://blog.naver.com/hjs4827/220318181119)
- [Interleaved_deltas](https://en.wikipedia.org/wiki/Interleaved_deltas)
- [History of Version Control Systems](https://mattrickard.com/history-of-version-control-part-1)
- [A History of Source Control Systems: SCCS and RCS ](https://experimentalworks.net/posts/2024-03-18-a-history-of-vcs-part1/)
- [Subversion (SVN)](https://curatepartners.com/blogs/skills-tools-platforms/subversion-svn-in-modern-software-development-a-deep-dive-for-enterprises-and-candidates/)
