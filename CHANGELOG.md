# Changelog

All notable changes to Monochrome Edge UI Components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.13.2] - 2025-10-12

### Bug Fixes

- fix: remove url() from CSS imports for postcss-import compatibility ([23cf9eb](../../commit/23cf9ebdbdf111e8180cc74d38bbe8773409a235))

### Other

- 1eedaegon ([](../../commit/))

## [1.13.1] - 2025-10-12

### Features

- feat: initialize stepper components on page load ([ec7ab2f](../../commit/ec7ab2fa9e4b0e191049d4c30e3d1fc230be91c6))

### Bug Fixes

- fix: load built CSS file instead of source CSS in local environment ([4c304e1](../../commit/4c304e1cc5799d97d30293fb38b06b42f1781d29))

### Chore

- chore: update npm packages to latest versions ([9327d51](../../commit/9327d511a17e20a898e86d26255bc8debdbef4b9))

### Other

- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))

## [1.13.0] - 2025-10-12

### Features

- feat: fix icon paths in HTML for GitHub Pages deployment ([ed492dd](../../commit/ed492dd8c052b9cc6440a91914578b60e65bf611))
- feat: fix GitHub Pages icon paths and improve CDN reliability ([b936757](../../commit/b9367576a2522a62de1caf489dfdf65f4fc30cb2))
- feat: add breadcrumb ([3a2370a](../../commit/3a2370a6c6351350bcaf4c22128072741b97aee9))
- feat: add completed icon && add stepper ([5076142](../../commit/50761425599803d01412ace79a56b6dd3d219ab4))

### Bug Fixes

- fix: update hardcoded CDN version from 1.10.0 to @latest ([c327ca1](../../commit/c327ca13bbfe66df0c5c70239d781c3a76598ae4))
- fix: remove plan and test file ([9b65ed2](../../commit/9b65ed28e9ea7fdef2338d7b4aac45ec45301485))
- fix: resolve '@' import path issues and TypeScript build warnings ([4dcc17f](../../commit/4dcc17f771879aa15b5556d7738b2b1d5ec7c906))
- fix: add truncate test to stepper ([051746d](../../commit/051746d5c46f9c944467df874e88dbd540e8b57c))
- fix: support web-component for icons ([d2b5c6f](../../commit/d2b5c6fdbdccc40472744e9f8a7c0a9fa3caf59b))
- fix: support cdn for icons ([b5ed2a9](../../commit/b5ed2a933e574c65c6ff302beabd50d9cedfaf50))
- fix: stepper icon dynamic loader ([f75e42c](../../commit/f75e42c685d02917f814cc57b9fa110d4a3145c8))
- fix: add seo and apply breadcrumb url ([7a34d5d](../../commit/7a34d5d10c47b1afdf38d19cd57abd282b8ca56f))
- fix: update icon loader support dev pages ([faaea96](../../commit/faaea963ca1f59e9a2c018d681a519ba8de46497))
- fix: unvisible search icon ([613bbba](../../commit/613bbba932341e7327b455c5880c31c1bdc5d078))
- fix: change name web-component prefix mono- to mce- ([0251653](../../commit/02516537b78821342daa5f0ac00c20fc09ccdcef))
- fix: enhance visibility stepper ([a3ec759](../../commit/a3ec7596a85930bc7284a7f2b37d9c3239300542))
- fix: increase the font size on stepper labels ([302447f](../../commit/302447f7d261bd4d6a459fe4954d83fda66811d5))
- fix: handle existing tags in CI release workflow ([195e255](../../commit/195e2555743f4717b5e6ef1acf0949b3633800bc))
- fix: enhance badge side attributes ([e96b380](../../commit/e96b380e71818dd97e3b2d2bb0223496a0315b49))
- fix: update language toggle button for libs ([ff13e6b](../../commit/ff13e6b5349ecc3af130f8a0a4536fdd7526b2e8))
- fix: update grid for icon system align ([efc0d45](../../commit/efc0d45d767ebaa63680dd7142595d41b0910da6))

### Documentation

- docs: add how to use on readme ([cf76908](../../commit/cf76908c3cc523a2f647fbdb50657e7632a6cc42))

### Chore

- chore: bump version to 1.10.0 [skip ci] ([ef6b6e5](../../commit/ef6b6e560d443c1dbecf01aa2b7b9e124dc84329))
- chore: bump version to 1.12.0 ([2fab146](../../commit/2fab1468326c0a3b0569ea37909fd46ad830210c))
- chore: bump version to 1.9.15 [skip ci] ([c198bc8](../../commit/c198bc8f5a7a6767680b0c32d0795e60276aa386))
- chore: bump version to 1.9.14 [skip ci] ([45b8b68](../../commit/45b8b688d65480a8a98f224bfed4731caf6fd8f3))
- chore: bump version to 1.9.13 [skip ci] ([d572032](../../commit/d5720326e011711b5ccacc1e071eac6457a10457))
- chore: bump version to 1.9.12 [skip ci] ([2b1d08e](../../commit/2b1d08e8c9154976fa3427cf8da3e234c932eee6))
- chore: bump version to 1.9.11 [skip ci] ([23803a9](../../commit/23803a9c20c0e47676c7d40cd755ab4646acfebd))
- chore: bump version to 1.9.10 [skip ci] ([2660760](../../commit/266076079fdec19dd024a6b7777c974fe35782be))
- chore: bump version to 1.9.9 [skip ci] ([e9d2d49](../../commit/e9d2d49de6fc35f370ee36b49ae097d95a99283c))
- chore: bump version to 1.9.8 [skip ci] ([915e580](../../commit/915e580140e654d4195a5f15018d2c03c90b2c7e))
- chore: bump version to 1.9.7 [skip ci] ([80b1102](../../commit/80b11024d0f5a28f1595118cdfc0f056cdefc29b))
- chore: bump version to 1.9.6 [skip ci] ([66383ad](../../commit/66383ad66bde176080b24f48db716bbf0b69e4db))
- chore: bump version to 1.9.5 [skip ci] ([b4ae659](../../commit/b4ae659dbd6c24de567142ec002a154f1133678e))
- chore: bump version to 1.9.4 ([cf1b710](../../commit/cf1b710120de580849a410aa003c53212b3e46aa))

### Other

- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))
- ci: fix auto bump version on ci ([95666be](../../commit/95666be1da865b675c5aa12061d6572efbbb8669))
- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))

## [1.10.0] - 2025-10-12

### Features

- feat: fix GitHub Pages icon paths and improve CDN reliability ([b936757](../../commit/b9367576a2522a62de1caf489dfdf65f4fc30cb2))

### Bug Fixes

- fix: update hardcoded CDN version from 1.10.0 to @latest ([c327ca1](../../commit/c327ca13bbfe66df0c5c70239d781c3a76598ae4))
- fix: remove plan and test file ([9b65ed2](../../commit/9b65ed28e9ea7fdef2338d7b4aac45ec45301485))
- fix: resolve '@' import path issues and TypeScript build warnings ([4dcc17f](../../commit/4dcc17f771879aa15b5556d7738b2b1d5ec7c906))
- fix: add truncate test to stepper ([051746d](../../commit/051746d5c46f9c944467df874e88dbd540e8b57c))
- fix: support web-component for icons ([d2b5c6f](../../commit/d2b5c6fdbdccc40472744e9f8a7c0a9fa3caf59b))
- fix: support cdn for icons ([b5ed2a9](../../commit/b5ed2a933e574c65c6ff302beabd50d9cedfaf50))
- fix: stepper icon dynamic loader ([f75e42c](../../commit/f75e42c685d02917f814cc57b9fa110d4a3145c8))

### Chore

- chore: bump version to 1.12.0 ([2fab146](../../commit/2fab1468326c0a3b0569ea37909fd46ad830210c))
- chore: bump version to 1.9.15 [skip ci] ([c198bc8](../../commit/c198bc8f5a7a6767680b0c32d0795e60276aa386))
- chore: bump version to 1.9.14 [skip ci] ([45b8b68](../../commit/45b8b688d65480a8a98f224bfed4731caf6fd8f3))
- chore: bump version to 1.9.13 [skip ci] ([d572032](../../commit/d5720326e011711b5ccacc1e071eac6457a10457))
- chore: bump version to 1.9.12 [skip ci] ([2b1d08e](../../commit/2b1d08e8c9154976fa3427cf8da3e234c932eee6))
- chore: bump version to 1.9.11 [skip ci] ([23803a9](../../commit/23803a9c20c0e47676c7d40cd755ab4646acfebd))
- chore: bump version to 1.9.10 [skip ci] ([2660760](../../commit/266076079fdec19dd024a6b7777c974fe35782be))

### Other

- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))
- 1eedaegon ([](../../commit/))
- ci: fix auto bump version on ci ([95666be](../../commit/95666be1da865b675c5aa12061d6572efbbb8669))

## Changes

