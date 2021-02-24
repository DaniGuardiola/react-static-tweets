import React, { Consumer, createContext, ProviderExoticComponent, ProviderProps, ReactNode, useContext } from 'react'
import { ConfigInterface } from 'swr'

// TODO: make this more specific
export type TweetAst = Array<any>

export interface TwitterContext {
  // static tweet ast info
  tweetAstMap: TweetAstMap

  // SWR config for dynamically fetching tweet ast info
  swrOptions: ConfigInterface
}

export interface TweetAstMap {
  [tweetId: string]: TweetAst
}

// Saves the tweets returned as props to the page
const OriginalTwitter = createContext<TwitterContext>({
  tweetAstMap: {},
  swrOptions: {
    fetcher: (id) =>
      fetch(`https://twitter-search.vercel.app/api/get-tweet-ast/${id}`).then(
        (r) => r.json()
      )
  }
})

type TwitterProviderProps = {
  value: Partial<TwitterContext>
  children?: ReactNode
}

// allows partials that override outer providers
function OverridingTwitterProvider ({ value, children }: TwitterProviderProps) {
  const currentContext = useContext(OriginalTwitter)
  const mergedContext = {
    ...currentContext,
    ...value
  }
  return <OriginalTwitter.Provider value={mergedContext}>{children}</OriginalTwitter.Provider>
}
// TODO: why this property? (see react ts definition of ExoticComponent)
OverridingTwitterProvider.$$typeof = OriginalTwitter.Provider.$$typeof

type OverridingProvider<T> = ProviderExoticComponent<ProviderProps<Partial<T>>>

type OverridableContext<T> = {
  Provider: OverridingProvider<T>,
  Consumer: Consumer<T>,
  displayName?: string
}

export const Twitter: OverridableContext<TwitterContext> = {
  Provider: OverridingTwitterProvider,
  Consumer: OriginalTwitter.Consumer,
  displayName: OriginalTwitter.displayName
}

export function useTwitter () {
  const twitterContext = useContext(OriginalTwitter)

  return twitterContext
}