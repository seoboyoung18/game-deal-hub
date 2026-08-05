package com.example.deal.repository;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.deal.domain.Deal;
import com.example.deal.domain.Game;
import com.example.deal.domain.Store;
import com.example.deal.dto.DealResponse;
import com.example.deal.dto.GameDetailResponse;
import com.example.deal.dto.GameMetaRef;
import com.example.deal.dto.GameSearchItem;
import com.example.deal.dto.SteamDealRef;
import com.example.deal.dto.StoreDto;
import com.example.deal.dto.StorePriceRow;

/**
 * MyBatis 매퍼. SQL 은 resources/mapper/DealMapper.xml.
 * 수집 저장 순서 주의: store → game → deal (FK).
 */
@Mapper
public interface DealMapper {

    // ---- 수집(쓰기) ----
    void upsertStore(Store store);

    void upsertGame(Game game);

    void upsertDeal(Deal deal);

    // ---- 스팀 KRW 보강 ----
    List<SteamDealRef> findSteamDealsForKrw(@Param("max") int max);

    void updateDealKrw(@Param("dealId") String dealId,
                       @Param("krwSale") BigDecimal krwSale,
                       @Param("krwNormal") BigDecimal krwNormal);

    // ---- 스팀 메타(장르·한국어 소개) 보강 ----
    List<GameMetaRef> findGamesForMeta(@Param("max") int max);

    void updateGameMeta(@Param("gameId") String gameId,
                        @Param("genres") String genres,
                        @Param("shortDescKo") String shortDescKo);

    List<String> findGenres();

    // ---- 서빙(읽기) ----
    List<DealResponse> findDeals(@Param("sort") String sort,
                                 @Param("storeId") String storeId,
                                 @Param("genre") String genre,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("offset") int offset,
                                 @Param("size") int size);

    long countDealsFiltered(@Param("storeId") String storeId,
                            @Param("genre") String genre,
                            @Param("minPrice") BigDecimal minPrice,
                            @Param("maxPrice") BigDecimal maxPrice);

    List<StoreDto> findActiveStores();

    // ---- 게임 상세 ----
    GameDetailResponse findGameMeta(@Param("gameId") String gameId);

    List<StorePriceRow> findGameDeals(@Param("gameId") String gameId);

    // ---- 게임 검색 ----
    List<GameSearchItem> searchGames(@Param("q") String q,
                                     @Param("offset") int offset,
                                     @Param("size") int size);

    long countSearchGames(@Param("q") String q);

    // ---- 검증/집계 ----
    long countDeals();

    long countGames();

    long countStores();
}
