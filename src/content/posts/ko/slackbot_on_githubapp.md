---
title: '슬랙 봇에 Github App을 도입해보자'
date: 2025-01-03
tags: ["python"]
category: "article"
excerpt: ""
draft: false
---

안녕하세요. 이번 글은 [처음 써보는 언어로 슬랙봇 만들기](https://www.romedev.me/post/lets_make_slackbot)에서 이어집니다.

코드는 역시나 [Github](https://github.com/Voyager003/algo_bot)에서 확인 가능합니다.

---

## 알고봇 프로토타입의 문제점

처음 개시한 슬랙봇은 다음과 같은 이슈가 있었습니다.

<img src="https://github.com/user-attachments/assets/698e0944-134e-4525-9ebd-9412043132f1" />

슬랙봇에서 명령어로 알고리즘 문제를 제출하게되면 제 소유의 Github 계정으로 PR과 Merge가 이뤄진다는 것입니다.

<img src="https://github.com/user-attachments/assets/82589b7e-f556-4d3a-b897-5d01233f9b1c" />

일반적으로 웹에서 PR을 생성할 때는 Fork한 레포지토리(downstream)에서 아카이빙 레포지토리(upstream)로 PR을 생성하는 과정은 write 권한이 없어도 가능한데, Github REST API는 약간 다르게 동작합니다.

<img src="https://github.com/user-attachments/assets/a82ed521-b353-4dbc-b84a-19ad708a2289" />

이는 [Github REST API 레퍼런스](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request)에 적혀있는 내용인데요, '한 레포지토리에서 다른 레포지토리의 base로 PR을 보낼 수 없다'는 것입니다.

내용에 의거하여 **사용자가 등록한 Github 토큰**으로 PR 생성을 시도하면 권한이 없음을 나타내는 `403` 에러가 발생하게 됩니다. 여기서 글또의 Organization에서 PR을 생성하려면 별도의 권한이 필요하다는 것을 알게되었습니다.

그래서 **글또 Organization 토큰**을 발급하여 PR 및 Merge를 수행하도록 작업하고 서비스를 개시했습니다.

시간이 지나며 사용자들이 문의주셨던 것 중 하나는 자신의 Github 계정으로 PR 및 Merge가 작동했으면 좋겠다는 의견이었습니다.

이 이슈는 알고봇을 서비스하기 전부터 고민하던 문제였으며 이에 대해 2가지 방법을 고려하게 됐습니다.

## 첫 번째 방법과 문제점

첫 번째 해결법은 사용자 별로 글또 Organization에 write 권한을 가진 토큰을 사용자마다 생성하는 방법입니다.

Organization 토큰을 사용자별로 발급받게되면 그 토큰을 사용함으로써 Organization에 접근할 권한을 갖게되고 이로써 사용자의 Github 계정으로 PR과 Merge가 가능하게 됩니다.

하지만 이 방법의 문제는 무엇일까요? 바로 운영 비용의 증가로 이어지게 됩니다.

<img src="https://github.com/user-attachments/assets/5dcbcd0f-cc2f-44f0-a303-8badd57c2cb2" />

최대한 타협하여 알고봇 사용자의 의견을 수렴하여 토큰을 한 번에 승인한다고 쳐도, 추후에 사용을 원하는 사용자들이 알고봇에 유입하게 된다면 그 별도의 토큰을 발급하기 위한 추가적인 운영비용이 늘어나게 됩니다.

그래서 이 방법은 우선 순위에서 밀려나게 되었습니다.

## 그래서 선택한 Github App

상기된 이유로 사용자 별로 토큰을 등록하는 방법은 채택되지 않았고 **봇 계정**이 PR과 Merge를 담당하도록 계획했습니다.

봇은 **Github App**을 사용해 제 계정으로 이루어지던 작업을 봇으로 대체하여 하나의 프로필 역할을 하게됩니다.

하지만 여전히 문제점은 사용자의 계정으로는 PR 및 Merge를 생성하지 못한다는 문제가 있었습니다.

기능을 요청한 사용자들의 의도는 자신의 Github에 PR을 남기기 위함이라는 것이었는데요, 알고봇 사용자 중 한 분인 '근호'님이 이에 대한 피드백을 주셨습니다.

<img src="https://github.com/user-attachments/assets/0e10fa00-7f3c-409a-9659-6fd2201be466" />

바로 커밋 메시지에 공동 작성자(Co-authored)를 추가하는 것입니다. 이 방법이라면 PR을 직접 생성할 순 없지만 커밋 이력을 남김으로써 Github에 기록할 수 있게 됩니다.

이제 문제를 해결해보겠습니다.

먼저 기존 작업을 살펴보겠습니다.

<img src="https://github.com/user-attachments/assets/8cfe0b4a-330c-42ea-b9e9-1040d248207e" />

주요 작업을 순서대로 살펴보면

1. CSV 파일의 **사용자의 GitHub 토큰**을 읽기 - (csv.reader(file))
2. 토큰에서 권한을 획득 - (Github(user_token))
3. 사용자가 Fork한 아카이빙 레포지토리(글또 Organization의 레포지토리)에 접근 - (g_user.get_repo...)
4. Fork한 브랜치에 알고리즘 풀이 브랜치를 생성 및 push - (user_fork.create_git_ref)
5. 선택한 리뷰 유무에 따라 **글또 Organization 토큰**으로 PR 생성 및 Merge 실행 - (archive_repo.create_pull)

여기서 대체해야 할 작업은 5번 작업입니다.

글또 Organization 토큰으로 수행하던 작업을 Github App을 추가하여 작업을 대신하도록 해보겠습니다. 먼저 Github App을 추가하도록 해봅시다.

### Organization에서 Github App 생성

먼저 Organization으로 이동합니다.

<img src="https://github.com/user-attachments/assets/0a222f70-36a5-4db9-8273-732a2bcd024d" />

실제로는 글또 Organization에서 실행해야하지만 봇 작동을 위해서 테스트용 Organization을 만들었습니다. 상단 메뉴의 오른쪽 가장 끝에 있는 `Settings`를 선택합니다.

<img src="https://github.com/user-attachments/assets/3cde5966-e11b-41a4-b0a7-a15c58b07c7b" />

이어서 왼쪽 메뉴 최하단의 `Developer settings`의 `Github Apps`를 선택합니다.

<img src="https://github.com/user-attachments/assets/796e84a5-3fac-4aaf-bd61-04b546a278f6" />

오른쪽 상단의 `New Github App`을 선택합니다.

<img src="https://github.com/user-attachments/assets/0a8419f3-1966-44c4-aa84-0230122c9f0a" />

선택하면 위와 같은 화면을 볼 수 있습니다. 여기서

봇의 이름인 `GitHub App name`과 `Homepage URL`을 입력해줍니다. 저같은 경우 아카이빙 레포지토리의 주소를 입력했습니다.

<img src="https://github.com/user-attachments/assets/52e7282d-60cb-4343-965c-ec15f15906b2" />

이 후 하단으로 내리다보면 `Webhook`를 볼 수 있는데, 사용하지 않기 때문에 `Active`를 비활성화 해줍니다.

<img src="https://github.com/user-attachments/assets/b007a61f-5515-4994-b7c3-9068b0730bcc" />

가장 중요한 `Permissions` 입니다. 저장소 및 관련 리소스에 대한 액세스를 허용하는 설정인데요

봇에 필요한 권한은 다음과 같습니다.

`Administration` - 'Read and write'
`Contents` - 'Read and write'
`Issues` - ‘Read and write’
`Metadata` - 'Read-only' (자동으로 설정)
`Pull requests` - ‘Read and write’

그리고 하단의 `Organization permissions`에서 `Members`를 'Read-only'로 설정합니다.

<img src="https://github.com/user-attachments/assets/c230f98f-dd93-42b1-91c6-482901b894f9" />

마지막으로, Github App의 설치 범위를 묻는 선택지가 나오는데요

`Only on this account` 를 선택하고 설치할 레포지토리를 지정한 뒤, `Create Github App` 으로 App을 생성하면 Github App 생성이 완료됩니다.

### Github App에 필요한 리소스 가져오기

이제 코드에서 Github App을 사용하기 위한 세 가지 리소스가 필요합니다.

리소스는 **App ID**, **Installation ID**, **PEM key(private key)** 이 세 가지가 이에 해당합니다.

<img src="https://github.com/user-attachments/assets/9b6746b3-4781-4c66-b985-4d1b4a0ac9c9" />

App을 생성하고 나면 다음과 같은 화면을 볼 수 있는데요

<img src="https://github.com/user-attachments/assets/517c05db-4af8-4682-b4ad-17524bc6be2e" />

여기서 하단으로 내려서 `Private keys` 로 이동하여, `Generate a private key`를 선택하면 pem key가 로컬에 다운로드됩니다.

필요한 **첫 번째 리소스**를 얻었습니다!

<img src="https://github.com/user-attachments/assets/ba287fd4-d9ac-4008-b56d-f927f0d358e6" />

이제 Github App을 설치해야합니다. 왼쪽 메뉴의 `Install App` 으로 이동해주세요.

<img src="https://github.com/user-attachments/assets/a43642e8-456c-4292-ba52-56d87fa2a8c8" />

위와 같이 Organization이 있는 것을 확인할 수 있습니다. Github App을 설치할 Organization 오른쪽의 `install` 을 선택합니다.

<img src="https://github.com/user-attachments/assets/e42b4bd0-fce4-4642-ab50-653c34926abd" />

선택하면 Github App 설치화면이 나오는데요, `Only select repositories` 를 선택하고 `Select repositories` 에서 Github App을 설치할 저장소를 선택하고 `install` 합니다.

<img src="https://github.com/user-attachments/assets/a260cde0-7c58-4dd6-94ba-56fa7d4cdb55" />

선택하고나면 위와 같은 화면을 볼 수 있는데요, 필요한 두 번째 리소스 `Installation ID`는 Github App 설치후에 나오는 화면의 url에서 확인 가능합니다.

저같은 경우 사진의 경우 URL의 끝 숫자인 ‘59003354’가 **Installation ID**에 해당합니다. 이것이 두 번째로 필요한 리소스입니다.

마지막 **App Id**. 이는 아까 생성했던 Github App에서 확인 가능한데요

<img src="https://github.com/user-attachments/assets/87e4e26f-34d1-4898-91c3-e3180112d5a4" />

Github App 페이지의 `About`에서 App ID를 확인할 수 있습니다.

위의 경우 ‘1099696’가 이에 해당합니다. 이것이 마지막으로 필요한 리소스입니다.

### 코드에 적용하기

Github App을 사용하기 위한 리소스는 모두 얻었습니다. 이제 코드에 적용해보겠습니다.

원래 코드에서 **5. 선택한 리뷰 유무에 따라 **글또 Organization 토큰**으로 PR 생성 및 Merge 실행** 작업만 Github App이 대체하도록하면 됩니다.

아까 얻은 리소스는 환경 변수로 사용하도록 하겠습니다. .env에 ID와 pem key를 넣고 사용하도록 하겠습니다.

<img src="https://github.com/user-attachments/assets/f9ffe8d6-a815-4f16-905f-6721442508c9" />

이제 코드를 대체해봅시다.

[Pygithub의 레퍼런스](https://pygithub.readthedocs.io/en/stable/examples/Authentication.html#app-authentication)를 살펴보면 Github App을 Application ID와 private key로 인증합니다.

<img src="https://github.com/user-attachments/assets/e1a6a1c7-0585-4108-b500-1fedb8cca388" />

코드에서는 다음 작업을 실행합니다.

1. GitHub App 인증에 필요한 환경변수 로드
2. Private Key를 사용한 GitHub App 인증
3. Installation 토큰 기반의 GitHub 클라이언트 생성
4. 종합하여 GitHub App 인증에 필요한 모든 로직을 하나의 클래스로 관리하여 생성

<img src="https://github.com/user-attachments/assets/fb2d5978-6639-4c56-99e6-81d997921c5f" />

이어서 획득한 권한으로 PR 생성을 진행합니다.

이 때, 요구하는 리소스를 환경변수에서 읽도록하고 테스트 환경에서 슬랙봇 명령어를 실행했는데, 디버깅 로그에서 다음과 같은 에러를 계속 마주했습니다.

<img src="https://github.com/user-attachments/assets/f0be1126-71f1-482c-aa1b-cf2a066ac7a1" />

번역해보면 'fork_collabo 권한이 없는 사람이 허락할 수 없습니다'는 것입니다. 이 에러의 의미를 하나씩 살펴봤습니다.

- status: 422 - 서버가 요청의 콘텐츠 유형을 이해하지만 포함된 지침을 처리할 수 없음
- resource: 'PullRequest' - 문제가 발생한 리소스 타입이 Pull Request
- code: 'custom' - 커스텀 에러 타입
- field: 'fork_collab' - fork된 레포지토리의 협업 권한(collaboration) 관련 필드에서 문제 발생
- message: "fork_collab Fork collab can't be granted by someone without permission" - 권한이 없는 사용자가 fork collaboration을 설정하려 시도

메시지로 추정하건대 GitHub의 권한 시스템에서 fork된 레포지토리에 대한 협업 권한을 설정하려 할 때 필요한 권한이 없어서 발생하는 문제라고 생각했습니다.

'뭔가 Collaborlator 권한을 필요로하나?' 라는 생각이 먼저 들어서 관련 키워드로 원인을 찾아보기로 했습니다.

키워드를 찾아봐도 원인을 못찾던 찰나에 [하나의 글](https://github.com/orgs/community/discussions/39178)을 발견했습니다.

<img src="https://github.com/user-attachments/assets/2ad15b25-038a-41eb-a77a-41e9c057ea2f" />

위 글에서 나타난 문제점은 다음과 같습니다.

GitHub App으로 조직 소유의 공개 레포지토리에 fork된 브랜치에서 PR을 생성하려고 했을 때 두 문제가 발생함

-> 사용자 계정으로 인증 시: 403 에러 ("Resource not accessible by integration")
-> 조직으로 인증 시: 422 에러 ("fork_collab Fork collab can't be granted by someone without permission")

이에 대한 해결책으로 PR 생성 요청에 `"maintainer_can_modify": False` 파라미터를 추가하면, GitHub App을 사용자 계정이 아닌 조직의 installation으로 인증하여 PR을 생성하도록 한다는 내용이었습니다.

<img src="https://github.com/user-attachments/assets/3daff40a-9f0a-437c-94c7-dbce26667222" />

<img src="https://github.com/user-attachments/assets/7f2ee6d0-0494-4b18-b2d4-dddce73cda5e" />

결국 저 한 줄을 추가하고나서 의도하던대로 비즈니스 로직이 작동하게되었습니다!

코드가 추가해서 작동된 이유는 자세하게는 모르겠지만 작동 방식을 생각하여 상황을 재구성해봤습니다.

Fork & PR의 기본 동작은 일반적으로 PR을 생성할 때, 원본 레포지토리의 관리자(maintainer)가 PR의 코드를 수정할 수 있다 -> 이는 fork된 레포지토리에 대한 쓰기 권한이 필요함

여기서 `'maintainer_can_modify=False'`를 선언함으로써 원본 레포지토리 관리자의 PR 수정 권한을 비활성화하고 fork된 레포지토리에 대한 추가 권한 부여가 필요없게 되고

GitHub App이 fork된 레포지토리에대한 협업 권한(fork collaboration)을 설정하지 않아도 되는 흐름이 아닐까 생각합니다.

<img src="https://github.com/user-attachments/assets/1a552aba-abd2-4a08-943c-83ff051cf39d" />

마지막으로 리뷰 유무에 따라 PR label을 설정하고, commit 메시지에 Co-authored를 추가했습니다.

<img src="https://github.com/user-attachments/assets/cafaa767-c617-45e4-aaba-90f829e7bc5c" />

코드 한 줄 때문에 4시간을 헤맸다는 것이 좀 머리 아팠지만, 결국 의도한 비즈니스 로직으로 업데이트하는 것을 성공했습니다!

## 맺음

24년에 마지막 날 업데이트를 마무리 할 예정이었는데 결국 다음 날까지 넘겨버렸습니다. 머리는 아팠지만 덕분에 새해를 산뜻하게 시작할 수 있었습니다. (이 맛에 코딩하지요)

하지만 여기서 끝이 아니라, 사용자 편의성을 위해 개선점을 찾아 계속 개선할 예정입니다.

새삼 서비스 하나를 만들고 운영하는 것이 이렇게 재밌는 일인지 느끼게 되는 하루입니다.

다소 긴 글인데 읽어주셔서 감사합니다. 다음은 회고글로 돌아오겠습니다.

<img src="https://media1.tenor.com/m/wOlC5m7NikkAAAAd/%EC%A0%9C%EB%A6%AC%EC%9D%B8%EC%82%AC-%EC%A1%B4%EC%A4%91.gif" />

## 출처

- https://docs.github.com/ko/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors
- https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request
- https://github.com/orgs/community/discussions/39178
- https://pygithub.readthedocs.io/en/stable/examples/Authentication.html#app-authentication
- https://docs.github.com/ko/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors
