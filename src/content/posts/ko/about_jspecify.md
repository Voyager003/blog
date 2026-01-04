---
title: 'Java Null 안전성의 새로운 표준, JSpecify'
date: 2025-12-07
tags: ["java"]
category: "article"
excerpt: ""
draft: false
---

## 개요

흔히 Java에서 null 참조를 [10억 달러짜리 실수](https://news.ycombinator.com/item?id=12427069)라고 하곤 합니다.

```java
public class User {
    private String name;      // null이어서는 안 되지만 컴파일러는 모르고
    private String nickname;  // null 가능하다고 의도했지만, 타입상 구분이 없음

    public User(String name, String nickname) {
        this.name = name; // null이 들어와도 컴파일 에러 X
        this.nickname = nickname;
    }

    public int getNameLength() {
        return name.length();  // name이 null이라면 NPE
    }
}

// 예시
User user1 = new User("Alice", null);     // nickname은 null 의도
User user2 = new User(null, "Bobby");     // name이 null - 런타임 에러 발생 가능
User user3 = null;                         // User 객체 자체도 null 가능

public void processUser(User user) {  // user가 null일 수 있는지 알 수가 없다..!
    user.getNameLength();  // user가 null이면 NPE 발생
}
```

Java는 null 값 처리에 있어서 항상 모호함이 있었습니다. 개발자가 매번 명시적으로 지정하지않고도 동작이나 컨텍스트에 따라 변수가 null 허용 가능 or 불가능으로 가정되기 때문이죠.

```java
public class User {
    @Nonnull
    private String name;      // null이 되어서는 안됨

    @Nullable
    private String nickname;  // null 가능

    public User(@Nonnull String name, @Nullable String nickname) {
        this.name = name;
        this.nickname = nickname;
    }
    ...
```

Java는 이 null의 불안전성을 개선하기 위해서 주로 어노테이션 형태로 null 허용 여부를 명시하여, API 사용자가 이 메서드가 null을 반환할 수 있는지 혹은 매개변수가 null을 허용할 수 있는지 즉시 알 수 있도록 하는 방식을 택했는데요:

- javax.annotation.Nullable (JSR-305)
- org.jetbrains.annotations.Nullable
- org.eclipse.jdt.annotation.Nullable

문제는 위처럼 어노테이션들이 표준화되지 않아 각각 미묘하게 다른 의미를 가지기도 하고, 도구 간 호환성이 부족하다는 맹점이 있었습니다.

이를 주시하고 있었는지(?) 25년 11월 13일에 release된 [Spring 7](https://spring.io/blog/2025/11/13/spring-framework-7-0-general-availability)에서는 `JSpecify`를 표준으로 채택하여 하나의 통일된 표준을 제공하게 되었는데 한 번 살펴봅시다.

## JSpecify

JSpecify는 크게 네 가지 키워드로 null 가능성을 나타냅니다.

### @NonNull

이름 그대로 해당 타입이 null을 아님을 나타내는 어노테이션입니다.

```java
// @NullMarked 없는 레거시 코드
public class LegacyService {

    // 이 반환값만 non-null임을 명시
    public @NonNull String getName() {
        return "name";
    }
}
```

후술할 `@NullMarked`가 아닌 코드에서 전체 패키지나 클래스에 @NullMarked를 적용하지 않은 상태에서, 특정 위치만 non-null임을 표시할 때 사용합니다.

다음으로 문서에서 설명하는 핵심 용도는 'non-null projection'인데 직역하면 non-null 투영인데 이 '투영', '프로젝션'이라는 단어가 잘 이해가 되질 않았습니다.

그래서 문서에서 나온 설명과 코드를 살펴보자면:

```java
@NullMarked
class MyOptional<T> {
    // T는 non-null 타입만 허용 (기본 상한이 Object)
}

@NullMarked
interface MyList<E extends @Nullable Object> {
    // E는 nullable 타입도 허용

    // ❌ 문제 발생!
    MyOptional<E> firstNonNull();
}
```

`MyList<@Nullable String>` 을 사용하면

- `E = @Nullable String`이 되버리고
- `firstNonNull()`의 반환 타입은 `MyOptional<@Nullable String>` 됩니다.
- 하지만 `MyOptional`은 `non-null 타입만 허용하므로 타입 에러가 발생하게 되지요.

```java
@NullMarked
interface MyList<E extends @Nullable Object> {

    // E의 non-null 버전으로 projection
    MyOptional<@NonNull E> firstNonNull();
}
```

하지만 E를 `@NonNull`로 명시한다면?

```java
MyList<@Nullable String> maybeNulls = ...;
MyList<String> nonNulls = ...;

// 둘 다 MyOptional<String> 반환
MyOptional<String> a = maybeNulls.firstNonNull();  // ✅
MyOptional<String> b = nonNulls.firstNonNull();    // ✅
```

E의 실제 타입이 `@Nullable String`이라면 @NonNull E 결과는 String가 되고, 실제 타입이 String이어도 String이 되겠지요!

아마 여러 입력이 같은 결과로 수렴한다는 의미에서 '변환'이 아니라 '투영'이라는 말을 쓴게 아닐지 추측을 해봅니다..

### @Nullable

역시나 이름 그대로 해당 타입이 null을 포함할 수 있음을 나타냅니다.

어노테이션 위치별 의미를 살펴보자면:

```java
// 패러미터 타입
void setField(@Nullable String value) { ... }
```

당연하지만(?) null을 전달해도 됩니다. 하지만? 런타임에 예외가 발생하지 않는다는 보장은 없다는거..

```java
// 반환 타입
@Nullable String getField() { return field; }
```

null을 반환할 수 있으며, 호출자는 null 가능성을 처리해야 합니다.

```
// 필드 타입
@Nullable String field;
```

필드도 null을 가질 수 있습니다. 모든 참조 타입 필드는 초기에 null이지만, 클래스가 초기화되지 않은 상태를 노출하지 않는다면 무시해도 됩니다.

```java
// 타입 인자
List<@Nullable String> getList() { ... }
```

코드는 List의 요소가 null일 수 있음을 나타냅니다.

만약 리스트 자체도 null일 수 있다면? `@Nullable List<@Nullable String>` 요런 식으로 작성하면 됩니다.

```java
// 타입 패러미터의 upper bound
class Container<E extends @Nullable Object> { ... }
```

E 자리에 nullable 타입 인자를 허용합니다.

```java
// 타입 변수 사용 (Nullable Projection)
class Foo<E extends @Nullable Object> {

    @Nullable E getOrNull() { ... }
}
```
@Nullable E는 타입 인자가 뭐든 항상 nullable로 투영합니다.

투영은 뭔지 위에서 언급했으니 패스하겠습니다.

```java
// 중첩 타입
Map.@Nullable Entry<String, String> entry;
```

Entry가 null일 수 있음을 나타냅니다. Java 문법상 @Nullable은 바로 뒤에 오는 타입에 적용되겠지요

```java
// Record 컴포넌트
record User(@Nullable String nickname, String name) {
    public User {
        Objects.requireNonNull(name);  // non-null 컴포넌트는 검증 필요
    }
}
```

JSR-305에도 있었는지는 모르겠는데 레코드에도 명시가 가능해졌는데 `@Nullable`이 생성자 파라미터와 접근자 메서드 반환 타입에 모두 적용됩니다.

문서에서는 non-null 컴포넌트를 compact constructor(파라미터와 할당을 생략하는 Record 전용 생성자)에서 Objects.requireNonNull()로 검증하는 것을 권장하고 있습니다.

### @NullMarked

해당 범위 내에서 어노테이션이 없는 타입은 기본적으로 non-null로 취급됩니다.

이러면 @NonNull을 반복해서 쓸 필요가 없어지게 되지 않을까요?

```java
@NullMarked
public class UserService {

    public String getName() { ... }           // non-null (기본값)
    public @Nullable String getNickname() { ... }  // nullable (명시)
}
```

원칙으로는 어노테이션 명시되어있지 않으면 non-null을, null 가능한 곳에만 @Nullable 표시하는 것입니다.

```java
// src/main/java/com/example/service/package-info.java
@NullMarked
package com.example.service;

import org.jspecify.annotations.NullMarked;
```

모듈, 패키지, 클래스, 인터페이스, 메서드, 생성자까지 모두 명시가 가능하지만 문서에서 권장하는 방식은 패키지 적용을 권장합니다.

이렇게 되면 새로 만드는 클래스가 자동으로 null-marked가 됩니다.

### @NullUnmarked

@NullMarked의 효과를 취소하여, 해당 범위를 null-unmarked 상태로 되돌리며, 이 때 어노테이션이 없는 타입은 nullness 미지정 상태가 됩니다.

어노테이션의 목적은 점진적인 마이그레이션을 염두에 두었는데:

- 1. 패키지에 `@NullMarked` 적용 (새 코드는 자동으로 null-safe)
- 2. 아직 마이그레이션 못한 클래스/메서드는 `@NullUnmarked`로 제외
- 3. 점진적으로 `@NullUnmarked` 제거
- 4. 완료 후 `@NullUnmarked` 사용 금지

이런 식으로 사용한다고 합니다.. 이건 나중에 쓸일이 있을 때 참고하면 좋을 듯 하네요.

## 맺음

`JSpecify` 외에도 Spring 7에 추가된 다른 기능도 한 번 써봐야겠습니다.

읽어주셔서 감사합니다.

## 출처

- [A Practical Guide to Null-Safety in Java With JSpecify](https://www.baeldung.com/java-jspecify-null-safety)
- [Nullness User Guide](https://jspecify.dev/docs/user-guide/)
