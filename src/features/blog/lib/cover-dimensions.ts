export type CoverDimensions = { width: number; height: number }

const COVER_DIMENSIONS: Record<string, CoverDimensions> = {
    "/images/aiapp/blog/mobiluri-aplikaciis-developeri-archevis-kriteriumebi-glass-v1.png": { width: 1536, height: 1024 },
    "/images/aiapp/blog/mobiluri-aplikaciis-motxovnebis-cheklisti-biznesistvis-glass-v1.png": { width: 1536, height: 1024 },
    "/images/blog-covers/kartul-inglisur-enaze-mobiluri-apis-dakveta.png": { width: 1672, height: 941 },
    "/images/blog-covers/loialobis-mobiluri-apis-qulebis-wesis-dakveta.png": { width: 1672, height: 941 },
    "/images/blog-covers/mitanis-tvaltvalis-apis-statusis-dakveta.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobilur-apshi-angarishis-shekmna-aghdgena-washla.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobilur-apshi-gadaxdis-integraciis-shedzena.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobilur-apshi-mdebareobis-gamoyenebis-dakveta.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-accessibility-mighebis-testi.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-analitikis-dakvetis-pirobebi.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-backend-admin-panel-dakvetis-charcho.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-booking-flow-dakvetis-charcho.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-maintenance-kontraqtis-scope.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-monacemta-ruka-dakvetamde.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-mvp-pirveli-shetavazebis-farglebi.png": { width: 1672, height: 941 },
    "/images/blog-covers/mobiluri-apis-store-angarishi-mflobeloba-gadacema.png": { width: 1672, height: 941 },
    "/images/blog-covers/natiuri-tu-kros-platformuli-mobiluri-api.png": { width: 1672, height: 941 },
    "/images/blog-covers/ormxrivi-bazris-mobiluri-apis-dakveta.png": { width: 1672, height: 941 },
    "/images/blog-covers/push-shetyobinebebis-mobilur-apshi-scope.png": { width: 1672, height: 941 },
    "/images/blog-covers/tanamshromlebis-mobiluri-apis-wvdomis-dakveta.png": { width: 1672, height: 941 },
}

export function getCoverDimensions(coverPath: string): CoverDimensions | undefined {
    return Object.hasOwn(COVER_DIMENSIONS, coverPath) ? COVER_DIMENSIONS[coverPath] : undefined
}
