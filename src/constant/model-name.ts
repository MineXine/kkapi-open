export enum UserModelName {
  User = 'kkapi_user_list',
  Token = 'kkapi_token_list',
}

export enum ISpeakModelName {
  ISpeakList = 'kkapi_ispeak_list',
  ISpeakTagList = 'kkapi_ispeak_tag_list',
  // 扩展：计数字段独立集合，避免经 PATCH /update 全字段透传被作者篡改
  ISpeakMeta = 'kkapi_ispeak_meta_list',
  ISpeakLike = 'kkapi_ispeak_like_list',
  ISpeakFavorite = 'kkapi_ispeak_favorite_list',
}

export enum ThirdPartyName {
  // 友链朋友圈库
  FriendCirclePost = 'Post',
}
