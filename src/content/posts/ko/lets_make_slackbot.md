---
title: '처음 써보는 언어로 슬랙봇 만들기'
date: 2024-12-22
tags: ["python", "test"]
category: "article"
excerpt: ""
draft: false
---

안녕하세요. 이번 글은 슬랙 봇을 만들면서 겪었던 문제와 해결 과정에 대해 다루려고 합니다.

내용 이해에 필요한 코드만 다루고, 자세한 코드 내용은 다루지 않는 점을 미리 밝힙니다.

코드는 [Github](https://github.com/Voyager003/algo_bot)에서 확인 가능합니다.

## 개요

글또 커뮤니티의 소모임 중에는 '오늘도한문제풀었또' 라는 채널이 있습니다.

채널 이름을 보면 알 수 있듯이 하루에 한 문제라도 알고리즘을 풀어 습관을 만들어가자는 취지로 만들어진 채널인데요, 평소처럼 알고리즘을 풀어서 제출하다가 필요한 점이 눈에 보였습니다.

<img src="https://github.com/user-attachments/assets/aa3e3002-5ca6-4803-837f-2d949649083b" />

채널 메시지를 보면 문제를 풀고 인증할 때 저렇게 메시지를 하나 남기는 것으로 문제를 풀었다는 것을 인증하고 있었는데요, 이러한 방식은 시각적으로도 좋지 않을 뿐더러 동기부여가 잘 안된다는 생각이 들었습니다.

마침 '오늘도한문제풀었또' 채널의 4장 지한님이 제출된 알고리즘 코드를 아카이빙 레포지토리로 관리하겠다는 계획이 언급되었는데, 이를 '슬랙봇의 명령어로 알고리즘 문제를 제출하도록하면 편하지 않을까?' 하여 슬랙봇 도입을 건의했습니다.

4장님의 반응도 긍정적이어서 앱의 핵심적인 기능만 추려서 봇 제작에 돌입했습니다.

## 초기 단계

먼저 MVP 기능은 명령어를 통해 다음 기능을 수행하도록 하는 것입니다.

- 알고리즘 풀이: 명령어를 실행하면 코드를 제출하고 아카이빙 레포지토리에 저장
- 알고리즘 조회: 작성했던 코드의 정보를 바탕으로 스트릭을 표시하도록하기.

처음엔 DB를 사용할까도 싶었는데 가벼운 작업이기 때문에 코드만 레포지토리에 저장하게 하고, 스트릭 생성을 위한 데이터만 CSV 파일로 저장하도록 계획했습니다.

프로그램 흐름을 그림으로 나타내면 다음과 같습니다.

<img src="https://github.com/user-attachments/assets/5a4c7e02-ac7c-4af1-8f10-782882e123eb" />

먼저 유저는 슬랙 워크스페이스에서 명령어를 통해 서버와 통신합니다.

서버는 Slack Bolt SDK 프레임워크를 통해 동작하며, 유저가 전달한 정보를 CSV 파일을 저장하고 스트릭 생성 시 CSV 파일을 조회하여 보여줍니다. CSV 파일이 DB 역할을 대신하는 것이죠.

CSV 파일에 대해 간단하게 설명하면 다음과 같지 몇 가지 필드를 쉼표(,)로 구분한 텍스트 데이터 및 텍스트 파일입니다.

<img src="https://github.com/user-attachments/assets/5d0fcc52-2e61-43f4-9777-258a75af7c04" />

이 Slack Bolt를 사용하려면 앱을 등록해야 하는데요, [Slack API](https://api.slack.com/apps)로 이동하여 `Create New App`을 선택합니다.

<img src="https://github.com/user-attachments/assets/b071a943-7a37-439c-baa3-1efdbf24830e" />

선택하면 다음과 같이 앱 이름과 워크 스페이스를 지정해줘야 하는데요, 글또 워크스페이스에 도입하기 전이어서 새 워크스페이스를 생성하고 진행했습니다.

<img src="https://github.com/user-attachments/assets/22e29cc7-9e5e-4e84-9617-5919327a1ffa" />

저같은 경우 '오늘도 한문제 풀었또'라는 워크스페이스를 만들어 지정했습니다.

이제 서버를 실행해야 하는데 방법은 [공식문서](https://tools.slack.dev/bolt-python/getting-started/)에 아주 잘 나와있습니다.

<img src="https://github.com/user-attachments/assets/ee49ada9-059c-490d-9713-f0978c35225f" />

서버를 실행하려면 `slack_bolt`가 필요합니다. 파이썬 작업 환경을 열고 `pip install slack_bolt`로 설치해줍니다.

코드를 보면 `SLACK_BOT_TOKEN`과 `SLACK_APP_TOKEN`이 필요한데요 설명에 따르면 각각 '봇 사용자와 연결', '앱에 대한 WebSocket 연결'을 생성하는데 사용됩니다.

<img src="https://github.com/user-attachments/assets/8975eb78-6bbc-4990-ab2b-1ae944bb1bc1" />

`Create New App`으로 앱을 생성하고 나면 볼 수 있는 화면인데요, `Enable Socket Mode`를 활성화합니다.

여기서 Socket mode에 간단하게 설명하자면 앱에서 공개 HTTP 요청(Public HTTP Request)을 노출하지 않고 WebSocket 연결을 기반으로 간단하게 슬랙 앱을 구축할 수 있는 기능입니다.

<img src="https://github.com/user-attachments/assets/06f934f9-a080-447c-95af-733037bcfbfa" />

활성화하면 위와 같이 토큰 명을 입력해야 하는데요, 원하는 이름으로 입력합니다.

<img src="https://github.com/user-attachments/assets/e8aacfe9-3089-47e4-ab59-31da7761ed74" />

이것이 위 코드에 필요한 `SLACK_APP_TOKEN`으로 설명을 보면 알 수 있듯이 웹소켓을 통해 앱의 상호작용과 이벤트 페이로드를 라우팅합니다.

<img src="https://github.com/user-attachments/assets/ec91c695-c884-4e11-847d-45ddca4d1a13" />

이어서 `Event-subscriptions`로 이동합니다.

슬랙 앱에서 봇 사용자가 채널의 메시지와 같은 이벤트를 수신하도록 해야하는데요, 여기에 `Add Bot User Event`로 이벤트를 추가하면 필요한 OAuth 범위가 추가됩니다.

<img src="https://github.com/user-attachments/assets/1a98e3c7-84c5-475b-add4-b11fbf6fe792" />

알고봇은 사용자의 메시지를 수신받아야하기 때문에 `message.im`과 `message.channels` 를 선택했습니다. 앱에서 구현하고자 하는 기능에 맞춰 이벤트를 선택하여 추가하면 됩니다.

<img src="https://github.com/user-attachments/assets/8be47a89-9204-497f-88d4-b82684eafa34" />

앱 생성 준비가 거의 다 끝났습니다. Features의 `App Home`에서 앱의 Bot 이름과 유저네임을 입력하고 저장합니다.

<img src="https://github.com/user-attachments/assets/1776213d-f5a4-4f0d-a0d7-1fdee505e988" />

마지막으로 워크스페이스에 앱을 설치하면 완료됩니다.

<img src="https://github.com/user-attachments/assets/76adddc5-3ef6-4647-acda-ff1e0f36a1da" />

앱 설치를 완료하면 서버 실행에 필요한 `SLACK_BOT_TOKEN` 값을 얻을 수 있습니다. 역시 복사해줍니다.

이제 Bolt 레퍼런스 대로 토큰을 등록하여 서버를 실행해봅시다.

토큰 같은 경우는 환경 변수로 관리하여 사용하면 좋은데, [dotenv](https://pypi.org/project/python-dotenv/)를 이용해 토큰을 불러와보겠습니다.

<img src="https://github.com/user-attachments/assets/c1d840a7-33e5-4f2b-acac-5570262eff85" />

환경 변수로 토큰을 입력하고 'main.py'를 실행하면

<img src="https://github.com/user-attachments/assets/5c7f1419-11f9-42c3-8515-9f0ca0832080" />

Bolt App가 실행 중이라는 메시지를 확인할 수 있습니다.

이제 슬랙 봇에서 명령어로 계획했던 기능을 수행하도록 해보겠습니다.

## 주요 기능 추가하기

명령어로 기능을 수행하도록 하려면 슬랙 앱에 명령어를 등록해야 합니다.

<img src="https://github.com/user-attachments/assets/efd5e4c9-283a-4d72-aa89-422e7d19397a" />

앱의 Features에서 `Slash Commands`를 선택합니다.

<img src="https://github.com/user-attachments/assets/bc347789-43e9-46d0-8d57-718cab9ee6ae" />

앱에서 사용할 명령어는 '/알고토큰', '/알고풀이'와 '/알고조회' 명령어로 지정하겠습니다.

커맨드와 설명을 입력하고 `Save`를 선택하여 내용을 저장해줍니다.

등록을 마쳤으니 명령어로 실제 알고리즘 풀이를 제출하는 기능을 구현해야 합니다. 흐름은 다음과 같습니다.

1. '/알고토큰' 명렁어로 요청자의 Github의 접근할 수 있는 토큰을 등록한다.
2. '/알고풀이' 명령어를 앱에 입력한다.
3. 알고리즘 풀이 정보를 입력할 수 있는 Modal을 띄운다.
4. Modal에 값을 입력한 뒤에 스트릭 생성을 위한 데이터를 CSV 파일에 저장한다
5. Github 아카이빙 레포지토리에 코드를 push하고 PR 및 Merge 한다.

2번과 3번 기능부터 구현해보도록 하겠습니다. 설명은 [레퍼런스](https://tools.slack.dev/bolt-python/concepts/opening-modals)를 따릅니다.

<img src="https://github.com/user-attachments/assets/b0984529-c118-41da-82df-9b931426d5d0" />

먼저 `@app.command` 로 명령어를 입력받고, 그 아래 함수에서 modal 폼을 정의합니다. 앱에서 명령어를 실행하게 되면

<img src="https://github.com/user-attachments/assets/0e9cb7c3-d39a-4d58-a6e8-6e897b340496" />

그림과 같이 modal을 확인할 수 있습니다. 이후 스트릭 생성에 필요한 정보를 modal로 전달하고 CSV 파일에 저장합니다. (흐름 상 중요한 내용은 아니어서 코드는 생략합니다.)

이제 가장 중요한 기능인 Github에서 PR 및 Merge하는 기능을 구현해야하는데요 이 부분은 Github REST API에 액세스하는 라이브러리인 [PyGithub](https://github.com/PyGithub/PyGithub)를 사용하기로 결정했습니다.

GitHub REST API를 직접 다루는 것은 저에게 난이도가 있다고 생각했고 API 요청을 Python 객체로 추상화하여 쉽게 사용할 수 있어 채택했습니다.

먼저 패키지를 설치합니다.

> pip install PyGithub

코드를 Push하거나 PR을 생성하는 기능은 다음의 흐름을 따르도록 계획했습니다.

공통적으로 사용자 요청을 받으면 **요청자의 fork한 아카이빙 레포지토리** 에서 브랜치를 생성하고 push합니다.

이 후, 리뷰 필요 유무에 따라 다음과 같이 분기됩니다.

- 리뷰가 필요하다면 PR을 생성하고, PR 링크를 채널에 표시하여 리뷰를 받을 수 있도록 함

- 리뷰가 필요없다면 PR을 생성하고, 아카이빙 레포지토리에 Merge

여기서 브랜치를 만들고 push하거나 PR 및 Merge 기능을 수행하려면 Github 권한이 필요한데 이는 토큰을 사용하기로 결정했습니다.

[Github의 token](https://github.com/settings/personal-access-tokens)을 이용하면 최소한의 권한을 지정한 토큰으로 API를 사용할 수 있습니다.

다음과 같이 PyGithub를 이용해 토큰을 다뤄 API에 접근할 수 있습니다.

<img src="https://github.com/user-attachments/assets/2b9044c1-be29-472e-b7b0-7b2920280e6f" />

CSV 파일에 저장되어 있는 유저의 토큰을 읽어들여 사용자 정보를 획득하고 이를 기반으로 fork 레포지토리에 접근하여 브랜치를 생성하고 Push하게 됩니다.

<img src="https://github.com/user-attachments/assets/a4911ed5-ddde-465b-8e7f-55fcaf0b6ffd" />

이어서 토큰으로 PR을 생성하고 리뷰 유무에 따라 리뷰를 생성하거나 Merge합니다.

여기서 겪은 문제가 있는데, 일반적으로 fork된 레포지토리에서 upstream에 PR을 올리는 것은 권한이 없어도 되는 것으로 인식하고 요청자의 토큰으로 PR을 수행하도록 했는데, 로깅을 해보니까 PR을 생성하는 부분에서 계속 403 Error를 내뱉었습니다.

<img src="https://github.com/user-attachments/assets/4e5ca50d-3655-47bd-b8ae-3e0c82770b1b" />

[REST API의 pull requests](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28) 문서를 참조해보니 다른 레포지토리의 베이스에 병합을 요청하는 PR은 한 레포지토리에 제출할 수 없다는 설명을 발견했습니다.

글또의 Organization 레포지토리에 접근하여 PR 및 Merge하려면 Organization의 아카이빙 레포지토리에 접근하기 위한 권한(토큰)이 필요하기 때문에 403 Error를 내뱉는 것 이었습니다.

결국 글또 Organization의 토큰을 따로 승인받고 생성 및 등록하여 이 토큰으로 PR 생성 및 Merge 하도록 변경하니 의도한대로 코드가 아카이빙 레포지토리로 저장됨에 동시에 채널의 메시지를 확인할 수 있었습니다.

<img src="https://github.com/user-attachments/assets/bbb2ca23-8642-48b3-9da1-f6e2d5dcd919" />

이번 프로젝트에서 가장 시간을 많이 잡아먹은 부분으로 왜 문제점을 빨리 발견못했을까 하는 아쉬움이 남는 부분입니다.

## 추가적인 이슈

슬랙봇을 통해 알고리즘을 제출하고 아카이빙 레포지토리에 저장하고 스트릭을 조회할 수 있는 기능(이 글에서 코드로 다루진 않았지만)을 모두 구현했습니다.

하지만 여기에 골치아픈 문제가 하나가 있었는데

<img src="https://github.com/user-attachments/assets/bf30d504-1f3e-4376-b429-884b7d64f2f4" />

PR 생성과 Merge가 모두 제 Github 계정으로 이루어진다는 것입니다.

원인을 찾아보니 글또의 Organization 토큰을 Generate한 계정이 저의 계정이기 때문에 발생하는 일이었습니다.

그래서 해결 방법으로 크게 두 가지 방법을 생각해봤습니다.

- 알고봇 사용을 원하는 사람들을 취합하여 글또 토큰을 한 번에 승인하여 저장하여 사용하기

이 방법은 알고봇을 사용하는 유저들에게 불편함을 주는 방법이어서 부적절하다는 생각이 들어 후순위로 밀려나게 되었고

- Github App에 Algobot을 추가하고 PR 생성 및 Merge를 담당하도록 만들기

이 경우는 PR, Merge를 담당하던 제 계정의 토큰이 아닌 Github App의 봇이 작업을 대신하여 하나의 프로필 역할을 하게 됩니다.

사실상 가능한 방법이 이것밖에 없다고 생각하여 Github App에서 이를 테스트해보고 성공한다면 바로 운영 서버에 적용하도록 계획했습니다.

이 이슈는 다음에 글에서 다뤄보도록 하겠습니다.

## 맺음

현재 알고봇의 기능은 서버에서도 잘 돌아가고, 다들 관심가지고 심지어 피드백도 주셔서 계속 개선하고 있습니다.

작업을 하면서 느낀 점은 이렇게 작은 앱조차도 사용자들이 불편함을 느낄까봐 노심초사인데 '실제 회사의 큰 서비스라면 얼마나 부담감이 심할까' 였습니다.

자고로 개발자면 '언어는 수단에 불과할뿐 아닌가?' 라는 생각으로 시작하여 파이썬은 문법만 대충 아는 상태로 시작했는데, 좋은 서비스를 만드는 방향을 고민할 수 있는 유익한 시간이 되었고 무엇보다 작업하면서 너무 재밌었습니다.

나중에 더 심화된 기능의 봇도 만들어보고 싶네요.

글은 여기까지 입니다. 읽어주셔서 감사합니다.

## 출처

- https://tools.slack.dev/bolt-python/getting-started/
- https://pygithub.readthedocs.io/en/stable/#
- https://www.inflearn.com/course/%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0-%EC%8A%AC%EB%9E%99-%EB%B4%87-%EB%A7%8C%EB%93%A4%EA%B8%B0/dashboard - 은찬님의 인프런 강의
