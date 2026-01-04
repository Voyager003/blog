---
title: 'Spec-kit 써볼까요?'
date: 2025-10-25
tags: ["ai"]
category: "article"
excerpt: ""
draft: false
---

## 개요

요즘 AI 툴이 굉장히 많이 등장하고 있는데 Github에서 [Spec-kit](https://github.com/github/spec-kit) 이라는 툴이 꽤나(?) 유행이어서 사용해봤습니다.

소개 문구를 보면..

> Build high-quality software faster.
>
> An open source toolkit that allows you to focus on product scenarios and predictable outcomes instead of vibe coding every piece from scratch.

라고 되어있는데, 대충 번역을 해보면 모든 코드를 처음부터 직접 작성하는 대신, 제품 시나리오와 예측 결과에 집중할 수 있도록 지원하는 툴킷이라고 하네요.

## Spec이 뭔가요

Spec이 뭐냐고 물었을 때 아직 일반적인 정의는 없는 것 같습니다.

그럼에도 정의해본다면..

> Spec(사양)은 소프트웨어 기능을 표현하고 AI 코딩 에이전트에게 지침 역할을 하는 자연어로 작성된 구조화된 동작 지향 아티팩트(또는 관련 아티팩트들의 집합)입니다. 스펙 기반 개발의 각 변형은 스펙의 구조, 세부 수준, 그리고 프로젝트 내에서 이러한 아티팩트가 구성되는 방식에 대한 접근 방식을 정의합니다.

여기서 Spec과 일반적인 컨텍스트 문서 사이에는 차이가 있는데, Spec이 좀 더 상위 수준(우선 순위가 높다고 하는게 맞을런지..)의 컨텍스트라는 것 입니다.

![](/img/what_is_SDD/01.png)

Cline 같은 에이전트에서는 이런 상위 수준의 컨텍스트를 `메모리 뱅크`라고 부릅니다.

이렇게 코드 작성 전에 명세서(spec)를 먼저 작성하여 접근하여 개발하는 방식을 `Spec-Driven-Development(SDD)` 라고 부릅니다.

## Spec-kit

![](/img/what_is_SDD/02.png)

Spec-kit은 Github가 SDD 방식으로 개발하는 것을 도와주는 도구입니다.

사실 Spec-kit 이전에 Kiro라는 툴이 먼저 이 방식을 도입했다고 하는데, 저는 대기열에 넣어놨다가 잊어버려서 어쩌다보니 Spec-kit을 먼저 써보게 되었네요.

한 번 설치해봅시다.

```bash
## Persistent Installation (Recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

## One-time Usage
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

공식 문서에서는 영구 설치를 권장하는데, 저는 일회용으로 설치했습니다.

작업하고 있는 디렉토리에 진입하고 터미널에 스크립트를 입력하면 다음과 같은 화면을 볼 수 있습니다.

![](/img/what_is_SDD/03.jpeg)

원래 지원하는 AI 에이전트가 별로 없었는데, 주기적인 업데이트를 통해서 거의 모든 에이전트가 추가되었네요.

저는 Codex CLI를 선택했습니다.

![](/img/what_is_SDD/04.jpeg)

설치를 하고나면 보안을 위한 유의 사항과 다음 단계를 알려줍니다.

.codex 디렉토리가 생성되는데 거기에 로그 및 세션 관리 파일같은게 남더라구요. 보안을 고려해서 .gitignore에 꼭 포함시켜 줍니다.

다음에는 환경 변수 설정을 위한 설정을 설명합니다.

Codex는 기본적으로 ~/.codex/를 참조하지만, 프로젝트별로 .codex 폴더가 존재할 경우 이렇게 경로를 직접 지정해줘야 프로젝트 로컬 명령을 인식합니다.

지정을 안하면 Spec-kit 커맨드 라인이 나타나지 않습니다. (경험담)

![](/img/what_is_SDD/05.jpeg)

이렇게 커맨드 라인이 나타납니다.

### Constitution

> /speckit.constitution ...

Spec-kit을 설치하고 나면 가장 먼저 작성해야 할 것은 constitution 입니다.

직역하면 '헌법'인데 "불변"하고 모든 변경 사항에 항상 적용되어야 하는 상위 수준의 원칙을 담고 있습니다.

실제로 국가의 헌법도 한 국가의 최고 법규이지 않습니까? 비슷한 이치입니다.

이 프로젝트가 constitution를 잘 이행하고 있는지는 진행해보면서 알아봐야 될 것 같습니다. 아직 어떤 내용을 constitution으로 지정해야될지 갈피가 안잡히기도 하구요.

![](/img/what_is_SDD/07.jpeg)

실행해보면 뭔가 열심히 만들고 있긴 합니다. 저같은 경우 테스트 기준, 성능 요구 사항 정도만 요청했습니다.

### Specify

> /speckit.specify ...

다음은 사양인데요 여기에는 기술 스택이 아니라 '무엇' 과 ' 왜' 에 집중하여 기술해야합니다.

예를 들어서 사진을 정리하는 애플리케이션을 구축한다고 하면 '사진을 별도의 앨범으로 정리할 수 있는 애플리케이션을 구축해야한다.', '각 앨범 내에서 사진은 타일 형태의 인터페이스로 미리 볼 수 있어야한다.' 이런 내용이 포함되어야 합니다.

### Plan

> /speckit.plan ...

plan은 개발자들이 좋아하는 기술적인 부분을 기술하는 파트입니다.

백엔드는 Java, Spring을 쓰고, DB는 Mysql 어쩌구.. 이런 내용이 되겠지요.

권장 사항은 원하는 스택, 아키텍처, 제약 조건을 제공하면 코딩 에이전트가 포괄적인 기술 계획을 생성해준다고 합니다.

### Task

> /speckit.tasks

tasks는 구현 계획에서 실행 가능한 작업 목록을 만드는 데 사용합니다.

예전에 나왔던 [Taskmaster](https://www.task-master.dev/)라는 툴과 유사한 작업을 하는 것 같습니다.

예를 들어 "빌드 인증"과 같이 이렇게 간단하게가 아니라, "이메일 형식을 검증하는 사용자 등록 엔드포인트 생성"과 같은 구체적인 작업을 지정해준다고 합니다.

### Implement

> /speckit.implement

이제 작성한 spec을 통해서 드디어 구현을 시작합니다. 에이전트는 작업을 하나씩 (또는 필요한 경우 병렬로) 처리하게 되지요.

Spec-kit에서 말하기로는 개발자는 수천 줄의 코드 덤프를 검토하는 대신, 특정 문제를 해결하는 변경 사항을 집중적으로 검토하는 쪽이라면, 코딩 에이전트는 명세에 따라 무엇을 만들어야 하는지 알고, 계획에 따라 어떻게 만들어야 하는지 알고, 작업에 따라 무엇을 해야 하는지 정확히 알고 있다고 합니다.

사실 말로는 그럴 듯한데 에이전트가 spec대로 얼마나 잘 이행하고 규칙을 잘 준수하는지는 지켜봐야겠네요.

## 지금까지 쓰면서 느낀 점

지금까지 쓰면서 느낀 점은 '0 to 1' 작업에는 꽤나 괜찮은 툴이라고 생각합니다.

다만 spec이나 plan 같은 걸 작성하는데 시간이 꽤 걸릴 뿐더러 맘대로 브랜치를 만들지를 않나(다소 빡침), 이런 부분은 컨트롤이 필요해보입니다. (저만 그런게 아니더군요 [Github Discussion: Evolving specs](https://github.com/github/spec-kit/discussions/152))

이건 Spec-kit 특성 상 기능의 수명이 아니라, Spec 자체를 살아있는 아티팩트로 봐서 그런 듯 합니다.

![](/img/what_is_SDD/06.png)

Spec-kit의 의도대로라면 이 Spec이라는게 한 번 쓰이고 마는게 아니라 살아 있는 문서처럼 관리해야 하는데, 이런 부분이 꽤 피로감있게 다가올 수도 있을 것 같습니다.

Spec 자체를 버전 관리 대상에 포함시켜서 관리한다면 꽤나 괜찮은 SDD가 가능하지 않을런지..

하지만 무엇보다 이걸 초기 템플릿으로 삼아 각자 자기에 입맞에 맞는 Spec-kit를 만들어본다면 베스트일 것 같네요

## 맺음

다음에는 Spec-kit으로 작업하면서 느낀 좋은점, 개선점을 적어보겠습니다.

읽어주셔서 감사합니다.

## 출처

- [Spec-kit](https://github.com/github/spec-kit)
- [Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)




